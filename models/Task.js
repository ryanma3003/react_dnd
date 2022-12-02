import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    point: {type: Number, min: 10, max: 1000},
    status: {type: String, required: true},
});

// export default mongoose.models.Task;
// export default mongoose.model('Task', taskSchema)
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;