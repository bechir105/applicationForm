const Application = require("../models/Application");
const path = require("path");
const fs = require("fs");

const validateField = (field, value) => {
  if (field.validation) {
    if (field.validation.required && !value) {
      return `${field.placeholder || field.name} is required`;
    }
    if (
      field.validation.minLength &&
      value.length < field.validation.minLength
    ) {
      return `${field.placeholder || field.name} must be at least ${
        field.validation.minLength
      } characters long`;
    }
    if (
      field.validation.minValue &&
      parseInt(value) < field.validation.minValue
    ) {
      return `${field.placeholder || field.name} must be at least ${
        field.validation.minValue
      }`;
    }
    if (
      field.validation.maxValue &&
      parseInt(value) > field.validation.maxValue
    ) {
      return `${field.placeholder || field.name} must be at most ${
        field.validation.maxValue
      }`;
    }
  }
  return null;
};

exports.createApplication = async (req, res) => {
  const { stepId, data } = req.body;
  try {
    const filePath = path.join(__dirname, "../steps.json");
    const formStructure = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const step = formStructure.steps.find((step) => step.stepId === stepId);
    if (!step) {
      return res.status(400).json({ msg: "Invalid step ID" });
    }

    let errors = {};
    step.fields.forEach((field) => {
      const error = validateField(field, data[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const application = new Application({ userId: req.user.id, stepId, data });
    await application.save();
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const { userId, stepId } = req.params;
    const application = await Application.findOne({ userId, stepId });
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
