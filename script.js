function exportCSV() {
    if (!transactions.length) {
        alert('No data to export.');
        return;
    }
    // Get all unique keys from all transactions for header
    const keys = Array.from(new Set(transactions.flatMap(obj => Object.keys(obj))));
    const csvRows = [keys.join(",")];
    transactions.forEach(t => {
        const row = keys.map(k => t[k] !== undefined ? t[k] : '').join(",");
        csvRows.push(row);
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
let transactions = JSON.parse(localStorage.getItem('dcaTransactions')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    document.getElementById('currentPrice').addEventListener('input', renderTable);
});

function copyToClipboard() {
    const url = "gabrielxoo@coinos.io";
    navigator.clipboard.writeText(url).then(() => {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "inline";
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 1000);
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

    // Store transaction
    transactions.push({ date, usd, buyPrice, quantity });
    saveTransactions();
    renderTable();

    // Clear inputs
    document.getElementById('dateInput').value = ''; // Vacío para que el usuario seleccione una nueva fecha
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

        // Mostrar la fecha directamente en formato YYYY-MM-DD
        const formattedDate = t.date;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>$${t.usd.toFixed(2)}</td>
            <td>${t.buyPrice.toFixed(2)}</td>
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

function fetchPrice(){
    fetch('https://api.diadata.org/v1/assetQuotation/Bitcoin/0x0000000000000000000000000000000000000000')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    data.Price = parseFloat(data.Price).toFixed(2);
    document.getElementById('currentPrice').value = data.Price;
    renderTable();
    // Handle the data
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

fetchPrice();