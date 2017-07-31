const inq = require("inquirer");
const db = require("./sqlConnect.js");
const Table = require("cli-table");


//********************************************
// Initialize Supervisor Welcome Screen
//********************************************

supervisorFront();

//********************************************
// App Funcs
//********************************************

function supervisorFront(){
  console.log(
`
***********************************************************
          WELCOME TO bAMAZON SUPERVISOR PORTAL!
***********************************************************

        Pick from the list of options below.
`
);
  menuScreen();
}

function menuScreen(){
  inq.prompt([
    {
      name: 'sOptions',
      type: 'list',
      choices: [' - VIEW PRODUCT SALES BY DEPARTMENT', ' - (+) ADD DEPARTMENT', ' - EXIT'],
      message: '\nWhat would you like to do?\n'
    }
    ]).then((choice)=>{
      if (choice.sOptions === ' - VIEW PRODUCT SALES BY DEPARTMENT'){
          viewSales();
        } else if (choice.sOptions === ' - (+) ADD DEPARTMENT'){
          createDepartment();
        } else if (choice.sOptions === ' - EXIT'){
          db.end();
        }
    })
}

// View Product SALES

function viewSales(){

  let table = new Table({head:['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit']})

  db.query(
  `SELECT d.department_id,
  d.department_name,
  d.over_head_costs,
  d.product_sales,
  d.product_sales - d.over_head_costs AS total_profit
  FROM departments d
  GROUP BY department_id`,
  (err, res, fields)=>{
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        let resArr=[];
        resArr.push(res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit);
        table.push(resArr);
      }
      console.log(table.toString());
      menuScreen();
    });

}


function createDepartment(){

  inq.prompt([
      {
        name:'newDept',
        type:'input',
        message:'Enter the New Department Name',
        validate: function(str){
          if(str === ''){
            return false;
          } else{
            return true;
          }
        }
      }
  ]).then((name)=>{

    db.query("INSERT INTO departments (department_name) VALUES (?)", name.newDept, (err, res, fields)=>{
      if (err) throw err;
      console.log(name.newDept + " was Added!");
      menuScreen();
    })
  })

}



// SELECT d.department_id,
// d.department_name,
// d.over_head_costs,
// p.product_sales,
// p.product_sales - d.over_head_costs AS total_profit
// FROM departments d
// INNER JOIN products p
// ON d.department_id = p.department_id
// GROUP BY department_id;
