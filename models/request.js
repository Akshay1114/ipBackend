import mongoose from 'mongoose';
const requestSchema = new mongoose.Schema({
  employee_ID: { type: String },
  name:{type: String},
  leaveType:{type: String},
  flightId: { type: String},
  reason:{type:String},
  start_date:{type:String},
    end_date:{type:String},
    status:{type:String}
});


const Request = mongoose.model('Request', requestSchema);

export default Request;
