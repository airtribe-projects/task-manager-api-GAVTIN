const express = require('express');
const app = express();
const port = 3000;
const taskRoutes = require('./routes/task');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/tasks', taskRoutes);

app.listen(port, (err) => {
    if (err) {
        return console.log('Error Occurred', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;
