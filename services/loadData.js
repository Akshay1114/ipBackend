// const mongoose = require("mongoose");
// const fs = require("fs");
// const connectDB = require('./db/index.js');
// MongoDB Connection
// mongoose.connect("mongodb+srv://avi:Secure@2021*@cluster0.k3rkf.mongodb.net/demoProjectDB?retryWrites=true&w=majority", {});

import mongoose from "mongoose";
import fs from "fs";
import { connectDB } from "../loaders/db/index.js";


// MongoDB Connection
async function connectToDB() {
  try {
    await connectDB();
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  }
}

connectToDB();

// Define Schemas
const CrewSchema = new mongoose.Schema({
  crewId: Number,
  name: String,
  role: String,
  certifications: [String],
  preferredShifts: [String],
  healthMetrics: {
    fatigueLevel: Number,
    sleepHours: Number,
    heartRate: Number
  }
});

const FlightSchema = new mongoose.Schema({
  flightId: String,
  departureLocation: String,
  arrivalLocation: String,
  departure: Date,
  arrival: Date,
  duration: Number,
  category: String
});

// Models
const Crew = mongoose.model("Crew", CrewSchema);
const Flight = mongoose.model("Flight", FlightSchema);

// Load Data from JSON
async function loadData() {
  try {
    // Read JSON Files
    const crewData = JSON.parse(fs.readFileSync("crewCollection.json", "utf8"));
    const flightData = JSON.parse(fs.readFileSync("flightCollection.json", "utf8"));

    // Insert Data into MongoDB
    await Crew.deleteMany(); // Clear existing data
    await Flight.deleteMany();
    await Crew.insertMany(crewData);
    await Flight.insertMany(flightData);

    console.log("Data loaded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error loading data:", err);
    mongoose.connection.close();
  }
}

loadData();
