alert("Welcome to the store!");

var name = prompt("Please enter your name:");
var item = prompt("What item would you like to order?");
var qty = parseInt(prompt("How many would you like? (1–99)"), 10);

if (isNaN(qty) || qty < 1 || qty > 99) {
  alert("Invalid number. Quantity set to 1.");
  qty = 1;
}

var now = new Date();
var hour = now.getHours();
var greet;

if (hour < 12)
  greet = "Good Morning";
else if (hour < 18)
  greet = "Good Afternoon";
else
  greet = "Good Evening";

var delivery = new Date();
delivery.setDate(delivery.getDate() + 7);

document.write("<h2>" + greet + " " + name + ", thank you for ordering!</h2>");
document.write("You ordered " + qty + " " + item + (qty > 1 ? "s" : "") + ".<br>");
document.write("Your order will arrive on " + delivery.toDateString() + ".");
