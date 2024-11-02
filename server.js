const express = require('express');
const Memcached = require('memcached');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;


const memcached = new Memcached('localhost:11216');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


const taskIds = [];


app.post('/tasks', (req, res) => {
    const taskId = Date.now(); 
    const task = req.body.task;

    memcached.set(`task_${taskId}`, task, 3600, (err) => { 
        if (err) {
            return res.status(500).json({ error: 'Failed to add task' });
        }
        taskIds.push(taskId); 
        res.status(200).json({ message: 'Task added', taskId });
    });
});


app.get('/tasks', (req, res) => {
    const tasks = [];
    let processedKeys = 0;


    taskIds.forEach((id) => {
        memcached.get(`task_${id}`, (err, data) => { 
            processedKeys++;
            if (data) {
                tasks.push({ taskId: id, task: data }); 
            }

            
            if (processedKeys === taskIds.length) {
                res.status(200).json({ tasks });
            }
        });
    });
});


app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    memcached.del(`task_${taskId}`, (err) => { 
        if (err) {
            return res.status(500).json({ error: 'Failed to delete task' });
        }

        const index = taskIds.indexOf(Number(taskId));
        if (index > -1) {
            taskIds.splice(index, 1);
        }
        res.status(200).json({ message: 'Task deleted' });
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); 
});
