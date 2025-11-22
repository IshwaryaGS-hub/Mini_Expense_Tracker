// Elements
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const addBtn = document.getElementById("add-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

// Add Transaction
addBtn.addEventListener("click", () => {
    const text = document.getElementById("text").value;
    let amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    if (!text || !amount) {
        alert("Please fill all fields");
        return;
    }

    //Prevent expenses before salary
    const salaryExists = transactions.some(t => t.category === "Salary");

    if (!salaryExists && category !== "Salary") {
        alert("Please enter Salary first!");
        return;
    }

    
    // If expense → convert amount to negative
    if (category !== "Salary") {
        amount = -Math.abs(amount); // Always negative for expenses
    }

    const transaction = {
        id: Date.now(),
        text,
        amount,
        category
    };

    transactions.push(transaction);
    saveLocal();
    updateUI();

    document.getElementById("text").value = "";
    document.getElementById("amount").value = "";
});

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveLocal();
    updateUI();
}

// Update UI
function updateUI() {
    list.innerHTML = "";

    let totalSalary = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        let li = document.createElement("li");

        li.className =
            "flex justify-between items-center bg-gray-50 border rounded-lg p-3";

        li.innerHTML = `
            <span class="font-medium">
                ${t.text}  
                <span class="text-sm text-gray-500">(${t.category})</span>
                <span class="ml-2 ${t.amount > 0 ? "text-green-600" : "text-red-600"}">
                    ₹${Math.abs(t.amount)}
                </span>
            </span>
            <button onclick="deleteTransaction(${t.id})" class="text-red-500">✖</button>
        `;

        list.appendChild(li);

        if (t.amount > 0) totalSalary += t.amount;
        else totalExpenses += Math.abs(t.amount);
    });

    income.textContent = totalSalary;
    expense.textContent = totalExpenses;

    // Balance = Salary – Expenses
    balance.textContent = totalSalary - totalExpenses;

    updateChart();
}

// Chart
function updateChart() {
    const categoryTotals = {};

    transactions.forEach(t => {
        if (t.amount < 0) {
            categoryTotals[t.category] =
                (categoryTotals[t.category] || 0) + Math.abs(t.amount);
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("expenseChart"), {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        "#ff6384",
                        "#36a2eb",
                        "#ffce56",
                        "#4bc0c0",
                        "#9966ff",
                    ],
                },
            ],
        },
    });
}

// Save Local
function saveLocal() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Initial Load
updateUI();
