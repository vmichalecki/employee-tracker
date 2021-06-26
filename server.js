// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");
require('dotenv').config();

// Connection to MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

let departmentInfo = [];
let roleInfo = [];
let employeeInfo = [];

const loadMenu = () => {
    loadDeptInfo();
    loadRoleInfo();
    loadEmployeeInfo();
    inquirer
        .prompt([
            {
                name: "menu",
                type: "list",
                message: "What would you like to do?",
                choices: [
                    "View all employees",
                    "Add employee",
                    "Update employee role",
                    "View roles",
                    "Add role",
                    "View departments",
                    "Add department",
                    "QUIT",
                ],
            },
        ])
        .then((answer) => {
            if (answer.menu === "View all employees") {
                readEmployees();
            }
            if (answer.menu === "Add employee") {
                addEmployee();
            }
            if (answer.menu === "Update employee role") {
                updateEmployeeRole();
            }
            if (answer.menu === "View roles") {
                readRoles();
            }
            if (answer.menu === "Add role") {
                addRole();
            }
            if (answer.menu === "View departments") {
                readDepartments();
            }
            if (answer.menu === "Add department") {
                addDepartment();
            }
        });
};

const readEmployees = () => {
    let queryString = `
  SELECT employee.id, first_name, last_name, title, salary, name AS department_name
  FROM employee
  LEFT JOIN role
  ON role_id = role.id
  LEFT JOIN department
  ON department_id = department.id`
    connection.query(queryString, (err, res) => {
        if (err) throw err;
        console.table(res);
        connection.end();
    });
};

const addEmployee = () => {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "Enter the employee\'s first name."
            },
            {
                name: "lastName",
                type: "input",
                message: "Enter the employee\'s last name."
            },
            {
                name: "role",
                type: "list",
                choices: roleInfo,
                message: "Select the employee\'s role."
            },
        ])
        .then((answer) => {
            console.log(roleInfo.indexOf(answer.role));
            connection.query(
                "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)",
                [answer.firstName, answer.lastName, roleInfo.indexOf(answer.role) + 1],
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} Done!\n`);
                }
            );
            readEmployees();
        })
};

const updateEmployeeRole = () => {
    inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                choices: employeeInfo,
                message: "Which employee would you like to update?",
            },
            {
                name: "role",
                type: "list",
                choices: roleInfo,
                message: "What is their new role?"
            }
        ])
        .then((answer) => {
            connection.query(
                // const newRole = answer.roleInfo,
                `UPDATE employee SET role_id = ${roleInfo.indexOf(answer.role) + 1} WHERE employee.id = ${answer.employee}`,
                [roleInfo.indexOf(answer.role) + 1],
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} Done!\n`);
                }
            );
            readEmployees();
        });
}

const addDepartment = () => {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "What's the Department name?",
            },
        ])
        .then((answer) => {
            console.log(answer);
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.department,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} Done!\n`);
                }
            );
            readDepartments();
        });
};

const addRole = () => {
    inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "What is the title?",
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary?"
            },
            {
                name: "depId",
                type: "list",
                choices: departmentInfo,
                message: "What's the Department?",
            },
        ])
        .then((answer) => {
            console.log(departmentInfo.indexOf(answer.depId) + 1);
            connection.query(
                "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                [answer.title, answer.salary, departmentInfo.indexOf(answer.depId) + 1],
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} Done!\n`);
                }
            );
            readRoles();
        });
};

const readRoles = () => {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        // console.log(res)
        console.table(res);
    });
};

const readDepartments = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};

const loadDeptInfo = () => {
    departmentInfo = []
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        res.forEach(index => {
            departmentInfo.push(index.name)
        });
    })
};

const loadRoleInfo = () => {
    roleInfo = []
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        res.forEach(index => {
            roleInfo.push(index.title)
        });
    })
};

const loadEmployeeInfo = () => {
    employeeInfo = []
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        res.forEach(index => {
            employeeInfo.push(index.id)
        });
    })
};

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    loadMenu();
});

// view employees by department
// inquirer asks what department
// select * from employee left join role on employee.role_id = role.id left join department on role.department_id = department.id where department = answer.department