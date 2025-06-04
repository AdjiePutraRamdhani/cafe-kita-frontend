// src/data/activeOrdersData.js
const activeOrdersData = [
    {
        id: 'ORDER001',
        tableNumber: 'Meja 5',
        items: [
            { id: 'M001', name: 'Nasi Goreng Spesial', quantity: 2, price: 25000 },
            { id: 'D001', name: 'Es Teh Manis', quantity: 2, price: 8000 },
        ],
        total: 66000,
        status: 'Menunggu', // Status awal
        timestamp: '2025-05-26 10:30:00'
    },
    {
        id: 'ORDER002',
        tableNumber: 'Take Away',
        items: [
            { id: 'D002', name: 'Kopi Susu Panas', quantity: 1, price: 15000 },
            { id: 'S001', name: 'Kentang Goreng', quantity: 1, price: 12000 },
        ],
        total: 27000,
        status: 'Diproses', // Status sedang diproses
        timestamp: '2025-05-26 10:45:00'
    },
    {
        id: 'ORDER003',
        tableNumber: 'Meja 1',
        items: [
            { id: 'M002', name: 'Mie Ayam Bakso', quantity: 1, price: 22000 },
        ],
        total: 22000,
        status: 'Menunggu',
        timestamp: '2025-05-26 11:00:00'
    },
];

export default activeOrdersData;