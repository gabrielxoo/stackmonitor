let transactions = JSON.parse(localStorage.getItem('dcaTransactions')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    document.getElementById('currentPrice').addEventListener('input', renderTable);
});

function copyToClipboard() {
    const url = "gabrielxoo@coinos.io"; // Replace with your URL
    navigator.clipboard.writeText(url).then(() => {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "inline";
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 1000); // Hide tooltip after 1 second
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

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
    const totalsDiv = document.getElementById('totals');
    const currentPrice = parseFloat(document.getElementById('currentPrice').value) || 0;

    tableBody.innerHTML = '';
    totalsDiv.innerHTML = '';

    let totalUsd = 0;
    let totalQuantity = 0;
    let totalValue = 0;

    transactions.forEach((t, index) => {
        const quantity = t.quantity || t.usd / t.buyPrice;
        const actualValue = quantity * currentPrice;
        const pl = actualValue - t.usd;
        const roi = t.usd !== 0 ? (pl / t.usd) * 100 : 0;

        totalUsd += t.usd;
        totalQuantity += quantity;
        totalValue += actualValue;

        // Procesar la fecha para evitar el ajuste de zona horaria
        const [year, month, day] = t.date.split('-'); // Divide la fecha en YYYY-MM-DD
        const formattedDate = new Date(year, month - 1, day).toLocaleDateString(); // Meses en JS son 0-indexados

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
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

    const totalPl = totalValue - totalUsd;
    const totalRoi = totalUsd !== 0 ? (totalPl / totalUsd) * 100 : 0;
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