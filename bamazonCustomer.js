const inq = require("inquirer");
const db = require("./sqlConnect.js");
const Table = require("cli-table");

//********************************************
// Initialize Storefront, Welcome Screen
//********************************************
storeFront();

//********************************************
// App Functions
//********************************************

function storeFront(){

  console.log(
`
***********************************************************
                  WELCOME TO bAMAZON!
            Thank you for shopping with us!
***********************************************************

        Here is a list of our current Merchandise.
        See anything you like?
`
);

  // Create new Table Object.
  let table = new Table({
      head: ['ID', 'Product','Price ($)', 'QTY'],
  });

  // Array of all the IDs to be used for validation later.
  let idArr = [];

  // Query Database for the relevant information.
  db.query('SELECT * FROM products', function (error, res, fields) {
    if (error) throw error;
    for (var i = 0; i < res.length; i++) {
      let tRow = [];
      tRow.push(res[i].item_id,res[i].product_name,res[i].price,res[i].stock_quantity);
      table.push(tRow);
      idArr.push(res[i].item_id);
    }
    // Push new rows to table.
    console.log(table.toString());
    customerInput(idArr);
  });

}


// Grab Customer Input
function customerInput(array){
  inq.prompt([
    {
      name:"productID",
      type:"input",
      message:"Enter the ID number of the product you wish to purchase: ",
    },
    {
      name:"productQTY",
      type:"input",
      message:"Enter the Quantity that you wish to purchase: ",
      default: 1,
    }
    ]).then(function(choice){
        let pid = parseInt(choice.productID);
        let pq = parseInt(choice.productQTY);

        // Check that both values are Numeric.
        if(isNaN(pid) || isNaN(pq)){
          console.log("\nPlease enter Numeric values for ID and QTY.\n")
          customerInput();
        }else{
          // Check if customer entered a non-existant ID number.
          if(array.indexOf(pid) === -1){
            console.log("\nIt seems like that product doesn't exist. Please enter a valid ID.\n")
            customerInput(array);
          }else{
            checkQty(pid, pq, array);
          }
        }

    });
}


// Check Quantity
function checkQty(id, qty, array){

  db.query('SELECT * FROM products WHERE item_id=?',id, function (error, res, fields) {
    if (error) throw error;

    let leftOverQty = res[0].stock_quantity - qty;
    let itemPrice = res[0].price;

    if (leftOverQty < 0){
      console.log("\nInsufficient Quantity!\n");
      customerInput(array);
    } else {
      let totalPrice = itemPrice * qty;
      updateSalesTotal(id,totalPrice);
      fulfillOrder(id, leftOverQty, totalPrice);
    }

  });
}

// Fulfill Order
function fulfillOrder(id, qty, price){
  db.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?',[qty, id], function (error, res, fields) {
    if (error) throw error;

    console.log(
`
***********************************************************
Thank you for Shopping with us today! Your total is: $ ${[price.toFixed(2)]}
***********************************************************
`);
    shopMore();

  });
}

// Check if Customer wants to continue Shopping
function shopMore(){

  inq.prompt([
  {
   name: 'shopmore',
   type: 'list',
   choices:['Yes', 'No'],
   message: 'Would you like to keep shopping?'
  }
  ]).then(function(answer){
    if(answer.shopmore === "Yes"){
      storeFront();
    } else {
      db.end();
    }
})

}

// Update Sales total
function updateSalesTotal(id,priceTotal){

  db.query("SELECT product_sales FROM products WHERE item_id= ?", id, (err,res,fields)=>{
    if (err) throw err;
    console.log("Sales Total Updated.");
    let currentTotal = res[0].product_sales;
    let updatedTotal = currentTotal + priceTotal;

    db.query("UPDATE products SET product_sales= ? WHERE item_id= ?", [updatedTotal, id], (err,res,fields)=>{
      if (err) throw err;
    })

  })
}
