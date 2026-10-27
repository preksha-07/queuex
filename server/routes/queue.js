
const express = require("express");
const mongoose = require("mongoose");
const QueueEntry = require("../models/QueueEntry");
const Service = require("../models/Service");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Join a service queue (logged-in users)
router.post("/join/:serviceId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({
        message: "Valid serviceId is required",
      });
    }

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Active service not found",
      });
    }

    const queueDate = getTodayDate();

    const existingEntry = await QueueEntry.findOne({
      user: userId,
      service: serviceId,
      queueDate,
      status: { $in: ["WAITING", "CALLED"] },
    });

    if (existingEntry) {
      return res.status(409).json({
        message: "You have already joined this queue",
        entry: existingEntry,
      });
    }

    const lastEntry = await QueueEntry.findOne({
      service: serviceId,
      queueDate,
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastEntry ? lastEntry.tokenNumber + 1 : 1;

    const entry = await QueueEntry.create({
      user: userId,
      service: serviceId,
      tokenNumber,
      queueDate,
    });

    return res.status(201).json({
      message: "Successfully joined the queue",
      entry,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Token conflict. Please try again.",
      });
    }

    console.error("Join queue error:", error.message);
    return res.status(500).json({
      message: "Failed to join queue",
    });
  }
});

// Get the logged-in user's queue entries
router.get("/my", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const entries = await QueueEntry.find({
      user: userId,
      queueDate: getTodayDate(),
    })
      .populate("service", "name averageServiceTime")
      .sort({ joinedAt: -1 });

    const results = await Promise.all(
      entries.map(async (entry) => {
        let peopleAhead = 0;

        if (entry.status === "WAITING" && entry.service) {
          peopleAhead = await QueueEntry.countDocuments({
            service: entry.service._id,
            queueDate: entry.queueDate,
            status: "WAITING",
            tokenNumber: { $lt: entry.tokenNumber },
          });
        }

        const averageTime = entry.service?.averageServiceTime || 10;

        return {
          ...entry.toObject(),
          peopleAhead,
          queuePosition:
            entry.status === "WAITING" ? peopleAhead + 1 : 0,
          estimatedWaitMinutes:
            entry.status === "WAITING" ? peopleAhead * averageTime : 0,
        };
      })
    );

    return res.json(results);
  } catch (error) {
    console.error("Get my queue error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch queue entries",
    });
  }
});

// Get a service's active queue (providers/admins only)
router.get(
  "/service/:serviceId",
  protect,
  authorizeRoles("PROVIDER", "ADMIN"),
  async (req, res) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.isValidObjectId(serviceId)) {
        return res.status(400).json({
          message: "Invalid service ID",
        });
      }

      const entries = await QueueEntry.find({
        service: serviceId,
        queueDate: getTodayDate(),
        status: { $in: ["WAITING", "CALLED"] },
      })
        .populate("user", "name")
        .sort({ tokenNumber: 1 });

      return res.json(entries);
    } catch (error) {
      console.error("Get service queue error:", error.message);
      return res.status(500).json({
        message: "Failed to fetch service queue",
      });
    }
  }
);

// Cancel the logged-in user's own queue entry
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid queue entry ID",
      });
    }

    const entry = await QueueEntry.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Queue entry not found for this user",
      });
    }

    if (!["WAITING", "CALLED"].includes(entry.status)) {
      return res.status(400).json({
        message: "This queue entry is no longer active",
      });
    }

    entry.status = "CANCELLED";
    await entry.save();

    return res.json({
      message: "Queue entry cancelled successfully",
      entry,
    });
  } catch (error) {
    console.error("Cancel queue error:", error.message);
    return res.status(500).json({
      message: "Failed to cancel queue entry",
    });
  }
});

// Call the next person (providers/admins only)
router.patch(
  "/service/:serviceId/next",
  protect,
  authorizeRoles("PROVIDER", "ADMIN"),
  async (req, res) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.isValidObjectId(serviceId)) {
        return res.status(400).json({
          message: "Invalid service ID",
        });
      }

      const nextEntry = await QueueEntry.findOneAndUpdate(
        {
          service: serviceId,
          queueDate: getTodayDate(),
          status: "WAITING",
        },
        {
          $set: { status: "CALLED" },
        },
        {
          new: true,
          sort: { tokenNumber: 1 },
        }
      ).populate("user", "name email");

      if (!nextEntry) {
        return res.status(404).json({
          message: "No waiting people in this queue",
        });
      }

      return res.json({
        message: "Next person called successfully",
        entry: nextEntry,
      });
    } catch (error) {
      console.error("Call next error:", error.message);
      return res.status(500).json({
        message: "Failed to call next person",
      });
    }
  }
);

// Mark a queue entry as served (providers/admins only)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("PROVIDER", "ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid queue entry ID",
        });
      }

      if (status !== "SERVED") {
        return res.status(400).json({
          message: "Status must be SERVED",
        });
      }

      const entry = await QueueEntry.findById(id);

      if (!entry) {
        return res.status(404).json({
          message: "Queue entry not found",
        });
      }

      if (entry.status !== "CALLED") {
        return res.status(400).json({
          message: "Only a called entry can be marked as served",
        });
      }

      entry.status = "SERVED";
      await entry.save();

      return res.json({
        message: "Queue entry marked served",
        entry,
      });
    } catch (error) {
      console.error("Update queue status error:", error.message);
      return res.status(500).json({
        message: "Failed to update queue status",
      });
    }
  }
);

module.exports = router;
