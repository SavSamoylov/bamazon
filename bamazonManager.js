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
    if (err) throw err;

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
      if (err) throw err;

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
          if (err) throw err;
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
      if (err) throw err;

      console.log("Thank You!");
      menuScreen();
    })
  }

}

// Add Product
function addProduct(){
  // Getting all the Department Names into an Array.
  let deptArr = [];
  db.query("SELECT department_name FROM products GROUP BY department_name", (err, res, fields)=>{
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      deptArr.push(res[i].department_name);
    }
    prodInq(deptArr);
  });

  // Prompt to get all the necessary values;
  function prodInq(departments){
    inq.prompt([
      {
        name: "productName",
        type: "input",
        message: "Enter Product Name:",
        default: "bAMAZON Product"
      },
      {
        name: "productPrice",
        type: "input",
        message: "Enter Product Price ($):"
      },
      {
        name: "productQty",
        type: "input",
        message: "Enter Product Quantity:",
        default: 1
      },
      {
        name: "productDept",
        type: "list",
        message: "What Department does the Product belong to?",
        choices: departments
      }
    ]).then((results)=>{
      let pName = results.productName;
      let pQty = validateQty(parseInt(results.productQty));
      let pDept = results.productDept;
      let pPrice = validatePrice(results.productPrice);

      addProdDB(pName, pDept, pPrice, pQty);


      function addProdDB(name, dept, price, qty){
        db.query("INSERT INTO products SET product_name=?, department_name=?, price=?, stock_quantity=?",[name, dept, price, qty],(err, res, fields) =>{
        if (err) throw err;
        console.log("\nThank You! New Merchandise has been added!\n")
        menuScreen();
        })
      }



      function validateQty(qty){
        if (qty > 0 && !isNaN(qty)){
          return qty;
        } else{
          console.log("\nInvalid Quantity!\n");
          addProduct();
        }
      }

      function validatePrice(price){

        if (price.indexOf('.') === -1){
          console.log("\nInvalid Price! Please include decimal points in the Price.\n");
          addProduct();
        } else {
          let p = parseFloat(price).toFixed(2);
          if (p > 0 && !isNaN(p)){
            return p;
          } else {
            console.log("\nInvalid Price!\n");
            addProduct();
          }
        }

      }


    });
  }
}

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
