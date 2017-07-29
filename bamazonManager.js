const inq = require("inquirer");
const db = require("./sqlConnect.js");
const Table = require("cli-table");


//********************************************
// Initialize Manager Welcome Screen
//********************************************

managerFront();

//********************************************
// App Funcs
//********************************************

function managerFront(){
  console.log(
`
***********************************************************
            WELCOME TO bAMAZON MANAGER PORTAL!
***********************************************************

        Pick from the list of options below.
`
);
  menuScreen();
}

function menuScreen(){
  inq.prompt([
    {
      name: 'optionsList',
      type: 'list',
      choices: [' - VIEW PRODUCTS', ' - VIEW LOW INVENTORY', ' - (+) ADD INVENTORY', ' - (+) ADD PRODUCT' ],
      message: 'What would you like to do?'
    }
    ]).then((choice) => {

      let c = choice.optionsList;

      if(c === ' - VIEW PRODUCTS'){
        let q = "SELECT * FROM products"
        viewProducts(q);
      } else if (c === ' - VIEW LOW INVENTORY'){
        let q = "SELECT * FROM products WHERE stock_quantity < 8"
        viewProducts(q);
      } else if (c === ' - (+) ADD INVENTORY'){
        addInventory();
      } else if (c === ' - (+) ADD PRODUCT'){
        addProduct();
      }

    })
}


// View Products
function viewProducts(query){

  let table = new Table({head:['ID', 'Product', 'Department', 'Price ($)', 'QTY']});

  db.query(query, (err, res, fields) => {
    for (var i = 0; i < res.length; i++) {
      let tRow = [];
      tRow.push(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity);
      table.push(tRow);
    }
    console.log("\n"+table.toString()+"\n");
    menuScreen();
  });
}

// Add to Inventory
function addInventory(){


  db.query("SELECT * FROM products", (err, res, fields)=>{
      let qArr = [];
      for (var i = 0; i < res.length; i++) {
        qArr.push(res[i].product_name);
      }
      getItem(qArr);

  });

  function getItem(array){
    inq.prompt([
      {
        name: "addInv",
        type: "list",
        message: "What Item would you like to add more of?",
        choices: array
      },
      {
        name: "addInvQty",
        type: "input",
        message: "How many would you like to Add?"
      }
    ]).then((choice)=>{

      if (parseInt(choice.addInvQty) > 0){
        db.query("SELECT * FROM products WHERE product_name=?", choice.addInv, (err, res, fields) =>{
          var currentQty = res[0].stock_quantity;
          var newQty = currentQty + parseInt(choice.addInvQty);
          addInvDB(choice.addInv, newQty);
        })
      } else {
        addInventory();
      }

    });
  }

  function addInvDB(prod, qty){
    db.query("UPDATE products SET stock_quantity=? WHERE product_name=?", [qty, prod], (err, res, fields) =>{
      console.log("Thank You!");
      menuScreen();
    })
  }

}

// Add Product

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
