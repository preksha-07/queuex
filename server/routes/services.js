
const express = require("express");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// GET all active services (public)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.json(services);
  } catch (error) {
    console.error("Get services error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch services",
    });
  }
});

// GET a single active service by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    return res.json(service);
  } catch (error) {
    console.error("Get service error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch service",
    });
  }
});

// CREATE a service (admin only)
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { name, description, averageServiceTime } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Service name is required",
        });
      }

      if (
        averageServiceTime !== undefined &&
        (!Number.isFinite(averageServiceTime) || averageServiceTime < 1)
      ) {
        return res.status(400).json({
          message: "Average service time must be a number of at least 1",
        });
      }

      const service = await Service.create({
        name: name.trim(),
        description,
        averageServiceTime:
          averageServiceTime === undefined ? 10 : averageServiceTime,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        message: "Service created successfully",
        service,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: error.message,
        });
      }

      console.error("Create service error:", error.message);
      return res.status(500).json({
        message: "Failed to create service",
      });
    }
  }
);

// UPDATE a service (admin only)
router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, averageServiceTime, isActive } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid service ID",
        });
      }

      const updates = {};

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            message: "Service name cannot be empty",
          });
        }

        updates.name = name.trim();
      }

      if (description !== undefined) {
        if (typeof description !== "string") {
          return res.status(400).json({
            message: "Description must be a string",
          });
        }

        updates.description = description;
      }

      if (averageServiceTime !== undefined) {
        if (
          !Number.isFinite(averageServiceTime) ||
          averageServiceTime < 1
        ) {
          return res.status(400).json({
            message: "Average service time must be a number of at least 1",
          });
        }

        updates.averageServiceTime = averageServiceTime;
      }

      if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
          return res.status(400).json({
            message: "isActive must be true or false",
          });
        }

        updates.isActive = isActive;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "Provide at least one field to update",
        });
      }

      const service = await Service.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!service) {
        return res.status(404).json({
          message: "Service not found",
        });
      }

      return res.json({
        message: "Service updated successfully",
        service,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: error.message,
        });
      }

      console.error("Update service error:", error.message);
      return res.status(500).json({
        message: "Failed to update service",
      });
    }
  }
);

module.exports = router;
