var products = [];
var editIndex = -1;

var productForm = document.getElementById("productForm");
var productSearch = document.getElementById("productSearch");
var inventorySort = document.getElementById("inventorySort");
var tableBody = document.getElementById("tableBody");
var addButton = document.getElementById("addBtn");

var productApi = {
  load: function() {
    try {
      var storedProducts = JSON.parse(localStorage.getItem("products"));
      products = Array.isArray(storedProducts) ? storedProducts : [];
    } catch (error) {
      products = [];
      localStorage.removeItem("products");
    }
    return products;
  },

  save: function() {
    localStorage.setItem("products", JSON.stringify(products));
    return products;
  },

  create: function(product) {
    products.push(product);
    return this.save();
  },

  update: function(index, product) {
    products[index] = product;
    return this.save();
  },

  remove: function(index) {
    products.splice(index, 1);
    return this.save();
  }
};

productForm.addEventListener("submit", function(event) {
  event.preventDefault();
  addProducts();
});

productSearch.addEventListener("input", showProducts);
inventorySort.addEventListener("change", showProducts);

tableBody.addEventListener("click", function(event) {
  var button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  var index = Number(button.getAttribute("data-index"));
  if (button.getAttribute("data-action") === "edit") {
    editProduct(index);
  } else if (button.getAttribute("data-action") === "delete") {
    deleteProduct(index);
  }
});

function showProducts() {
  products = productApi.load();

  var search = productSearch.value.trim().toLowerCase();
  var sortOrder = inventorySort.value;
  var totalStockValue = 0;

  for (var i = 0; i < products.length; i++) {
    totalStockValue += Number(products[i].PRICE) * Number(products[i].QUANTITY);
  }
  document.getElementById("totalStockValue").textContent = totalStockValue.toFixed(2);
  tableBody.replaceChildren();

  if (products.length === 0) {
    showEmptyMessage("No products registered yet.");
    return;
  }

  var visibleProducts = products
    .map(function(product, j) {
      var searchableText = [product.NAME, product.CATEGORY, product.PRICE, product.QUANTITY]
        .join(" ")
        .toLowerCase();

      if (searchableText.indexOf(search) !== -1) {
        return { product: product, index: j };
      }

      return null;
    })
    .filter(function(item) {
      return item !== null;
    });

  if (sortOrder !== "default") {
    var sortField = sortOrder.indexOf("price-") === 0 ? "PRICE" : "QUANTITY";
    var sortDirection = sortOrder.indexOf("-ascending") !== -1 ? 1 : -1;
    visibleProducts.sort(function(a, b) {
      return sortDirection * (Number(a.product[sortField]) - Number(b.product[sortField])) ||
        a.index - b.index;
    });
  }

  if (visibleProducts.length === 0) {
    showEmptyMessage("No matching products found.");
    return;
  }

  for (var k = 0; k < visibleProducts.length; k++) {
    var item = visibleProducts[k];
    var row = document.createElement("tr");
    appendCell(row, k + 1);
    appendCell(row, item.product.NAME);
    appendCell(row, item.product.CATEGORY);
    appendCell(row, item.product.PRICE);
    appendCell(row, item.product.QUANTITY);

    var actionsCell = document.createElement("td");
    actionsCell.appendChild(createActionButton("edit", item.index, "Edit", "edit-btn"));
    actionsCell.appendChild(document.createTextNode(" "));
    actionsCell.appendChild(createActionButton("delete", item.index, "Delete", "delete-btn"));
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  }
}

function appendCell(row, value) {
  var cell = document.createElement("td");
  cell.textContent = value;
  row.appendChild(cell);
}

function createActionButton(action, index, label, className) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "btn " + className;
  button.textContent = label;
  button.setAttribute("data-action", action);
  button.setAttribute("data-index", index);
  return button;
}

function showEmptyMessage(message) {
  var row = document.createElement("tr");
  var cell = document.createElement("td");
  cell.colSpan = 6;
  cell.className = "empty";
  cell.textContent = message;
  row.appendChild(cell);
  tableBody.appendChild(row);
}

function editProduct(index) {
  var product = products[index];
  if (!product) {
    return;
  }

  document.getElementById("NAME").value = product.NAME;
  document.getElementById("CATEGORY").value = product.CATEGORY;
  document.getElementById("PRICE").value = product.PRICE;
  document.getElementById("QUANTITY").value = product.QUANTITY;
  editIndex = index;
  addButton.textContent = "Update Product";
  window.scrollTo(0, 0);
}

function deleteProduct(index) {
  if (confirm("Delete this product?")) {
    productApi.remove(index);
    showProducts();
  }
}

function addProducts() {
  var name = document.getElementById("NAME").value.trim();
  var category = document.getElementById("CATEGORY").value;
  var price = document.getElementById("PRICE").value.trim();
  var quantity = document.getElementById("QUANTITY").value.trim();

  if (name === "" || price === "" || quantity === "") {
    alert("Please fill all the fields");
    return;
  }

  if (Number(price) <= 0 || Number(quantity) < 0) {
    alert("Price must be greater than zero and quantity cannot be negative.");
    return;
  }

  var product = { NAME: name, CATEGORY: category, PRICE: price, QUANTITY: quantity };

  if (editIndex === -1) {
    productApi.create(product);
  } else {
    productApi.update(editIndex, product);
    editIndex = -1;
    addButton.textContent = "Add Product";
  }

  showProducts();
  productForm.reset();
}

productApi.load();
showProducts();
