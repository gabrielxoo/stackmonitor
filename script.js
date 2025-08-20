let transactions = JSON.parse(localStorage.getItem('dcaTransactions')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    document.getElementById('currentPrice').addEventListener('input', renderTable);
});

function addTransaction() {
    const date = document.getElementById('dateInput').value;
    const usd = parseFloat(document.getElementById('usdInput').value);
    const buyPrice = parseFloat(document.getElementById('buyPriceInput').value);
    const quantity = parseFloat(document.getElementById('quantityInput').value);

    // Validate inputs
    if (!date || isNaN(usd) || isNaN(buyPrice) || isNaN(quantity) || usd <= 0 || buyPrice <= 0 || quantity <= 0) {
        alert('Please enter valid date, USD, buy price, and quantity.');
        return;
    }

    // Store transaction without any calculations
    transactions.push({ date, usd, buyPrice, quantity });
    saveTransactions();
    renderTable();

    // Clear inputs
    document.getElementById('dateInput').value = '';
    document.getElementById('usdInput').value = '';
    document.getElementById('buyPriceInput').value = '';
    document.getElementById('quantityInput').value = '';
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTable();
}

function saveTransactions() {
    localStorage.setItem('dcaTransactions', JSON.stringify(transactions));
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const totalsDiv = document.getElementById('totals'); // Reference the totals div
    const currentPrice = parseFloat(document.getElementById('currentPrice').value) || 0;

    // Clear table and totals
    tableBody.innerHTML = '';
    totalsDiv.innerHTML = '';

    let totalUsd = 0;
    let totalQuantity = 0;
    let totalValue = 0;

    // Populate table rows
    transactions.forEach((t, index) => {
        const quantity = t.quantity || t.usd / t.buyPrice; // Fallback for old transactions
        const actualValue = quantity * currentPrice; // Calculate Actual Value
        const pl = actualValue - t.usd; // Calculate P&L
        const roi = t.usd !== 0 ? (pl / t.usd) * 100 : 0; // Calculate ROI

        totalUsd += t.usd;
        totalQuantity += quantity;
        totalValue += actualValue;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td>$${t.usd.toFixed(2)}</td>
            <td>${t.buyPrice.toFixed(0)}</td>
            <td>${quantity.toFixed(8)}</td>
            <td>$${actualValue.toFixed(2)}</td>
            <td>$${pl.toFixed(2)}</td>
            <td>${roi.toFixed(2)}%</td>
            <td class="delete-td"><button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Populate totals section with "TOTAL USD USED IN BUYS" emphasized
    const totalPl = totalValue - totalUsd; // Total P&L
    const totalRoi = totalUsd !== 0 ? (totalPl / totalUsd) * 100 : 0; // Total ROI
    const avgBuyPrice = totalQuantity !== 0 ? totalUsd / totalQuantity : 0;

    totalsDiv.innerHTML = `
        <h3>Metrics</h3>
        <p>Total USD used: <strong>$${totalUsd.toFixed(2)}</strong></p>
        <p>Average buy price: <strong>${avgBuyPrice.toFixed(0)}</strong></p>
        <p>Total stacked: <strong>${totalQuantity.toFixed(8)}</strong></p>
        <p>Total actual value in USD: <strong>$${totalValue.toFixed(2)}</strong></p>
        <p>Total P&L: <strong>$${totalPl.toFixed(2)}</strong></p>
        <p>Total ROI: <strong>${totalRoi.toFixed(2)}%</strong></p>
    `;
}