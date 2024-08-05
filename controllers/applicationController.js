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
    const { userId } = req.params; // Change: Removed stepId from params
    const application = await Application.findOne({ userId }); // Change: Removed stepId from query
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.saveProgress = async (req, res) => {
  const { stepId, data } = req.body;
  const userId = req.user.id;

  try {
    const filePath = path.join(__dirname, "../steps.json");
    const formStructure = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const step = formStructure.steps.find((step) => step.stepId === stepId);
    if (!step) {
      console.log("Invalid step ID");
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
      console.log(errors);
      return res.status(400).json({ errors });
    }

    // Check if the application already exists
    let application = await Application.findOne({ userId });

    if (!application) {
      // Create a new application if it doesn't exist
      application = new Application({
        userId,
        steps: [{ stepId, data }],
        completed: false, // Initial state
      });
    } else {
      // Update existing application
      const stepIndex = application.steps.findIndex(
        (step) => step.stepId === stepId
      );

      if (stepIndex !== -1) {
        // Update existing step
        application.steps[stepIndex].data = data;
      } else {
        // Add new step if it doesn't exist
        application.steps.push({ stepId, data });
      }

      // Check if all steps are complete to mark the application as finished
      if (stepId === "3" && !application.completed) {
        application.completed = true;
      }
    }

    // Save the application
    await application.save();

    // Include userId in the response
    res.json({
      userId: application.userId, // Ensure this is included
      steps: application.steps,
      completed: application.completed,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.getApplicationProgress = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch the application based on userId
    const application = await Application.findOne({ userId });

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Extract relevant progress information
    const progress = {
      steps: application.steps.map((step) => ({
        stepId: step.stepId,
        data: step.data,
        completed:
          step.stepId ===
          application.steps[application.steps.length - 1].stepId,
      })),
      completed: application.completed,
    };

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
