const mysql = require('mysql');
const inquirer = require('inquirer');
require('console.table');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employees_db',
});

const createDepartment = () => {
    inquirer
        .prompt([
            {
                name: 'department',
                type: 'input',
                message: 'What\'s the Department name?',
            },
            {
                name: 'departmentId',
                type: 'number',
                message: 'What\'s the Department ID?',
            },
        ])
        .then((answer) => {
            console.log(answer);
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answer.department,
                    id: answer.departmentId,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} Done!\n`);
                }
            );
            readDepartment();
        })
};

const readDepartment = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    createDepartment();
});