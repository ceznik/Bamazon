var colors = require('colors');
var prompt = require('prompt');
var mysql = require('mysql');
var Table = require('cli-table');
var keys = require('./keys.js');
console.log(keys.databaseCreds);

var table = new Table({
	head: ['Product ID', 'Product Name', 'Price'],
	colWidths: [15, 40, 10]
});
var connection = mysql.createConnection(keys.databaseCreds);

connection.connect(function (error) {
    if (error) throw error;
    console.log(colors.green('Connected as id ' + connection.threadId));
});

connection.query("Select * FROM products", function (error, rows) {
    if (error) throw error
    console.log(colors.green(rows.length + ' products available for sale.'));
	//console.log(colors.green('Product ID' + '\t' + 'Product Name' + '\t\t\t\t' + 'Price'));
	//console.log(colors.green('----------' + '\t' + '------------' + '\t\t\t\t' + '-----'));
	for (var i = 0; i < rows.length; i++){
		table.push([rows[i].ItemId, rows[i].Name, rows[i].Price])		
	}
	console.log(table.toString());
	prompt.start();
	prompt.get(['productid', 'qty'], function(error, result){ //Get the product id and quantity requested from the user
		console.log('Bamazon product inquiry received:');
		connection.query("Select * From products Where ItemId=" + result.productid, function(error, rows){
			if (error) throw error
			console.log('Order Placed. Here are the details...');
			console.log('Product Selected: '.magenta + rows[0].Name);
			console.log('Quantity Requested: '.magenta + result.qty);
			console.log('Total Cost: $' + (rows[0].Price * result.qty).toFixed(2));
			if (rows[0].StockQuantity >= result.qty){
				connection.query('Update products set StockQuantity=' + (rows[0].StockQuantity - result.qty).toFixed(0) + ' where ItemId=' + result.productid);
				console.log(colors.green('Order placed. Your order will ship as soon as possible.'));
				console.log
			}else{console.log(colors.red('Insufficient quantity. Order NOT PLACED'))};
			connection.end();
		});
		prompt.stop();

	});

});