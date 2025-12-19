import mongoose from "mongoose";

const patientSchema = mongoose.Schema({

    fullName : {type: String},
    phone  : {type: String},
    email  : {type: String},
    address  : {type: String},
    age  : {type: Number},
    gender  : {type: String},
    emergencyContact : {type: String},
    emergencyPhone : {type: String},

}, { timestamps: true } )

const Patient = mongoose.model("Patient" , patientSchema)

export default Patient;