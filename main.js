<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clearscape Tracker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 500px;
      margin: auto;
      background: #f9f9f9;
    }
    h1 {
      text-align: center;
      margin-bottom: 24px;
    }
    label {
      display: block;
      margin-top: 12px;
      font-weight: bold;
    }
    input, select, button {
      width: 100%;
      padding: 8px;
      margin-top: 4px;
      box-sizing: border-box;
      font-size: 16px;
    }
    .recurring-group {
      margin-top: 12px;
    }
    button {
      background-color: #0078d4;
      color: white;
      border: none;
      margin-top: 16px;
      cursor: pointer;
    }
    button:hover {
      background-color: #005fa3;
    }
  </style>
</head>
<body>
  <h1>Clearscape Tracker</h1>

  <form onsubmit="addTransaction(); return false;">
    <label for="date">Date:</label>
    <input type="date" id="date" required>

    <label for="type">Type:</label>
    <select id="type">
      <option value="Sale">Sale</option>
      <option value="Expense">Expense</option>
      <option value="Deposit">Deposit</option>
    </select>

    <label for="category">Category:</label>
    <input type="text" id="category">

    <label for="amount">Amount:</label>
    <input type="number" id="amount" step="0.01" required>

    <label for="note">Note:</label>
    <input type="text" id="note">

    <label for="person">Person:</label>
    <input type="text" id="person">

    <div class="recurring-group">
      <label>
        <input type="checkbox" id="recurringToggle"> Repeat this transaction
      </label>

      <label for="recurringFrequency" id="recurringLabel" style="display:none;">Frequency:</label>
      <select id="recurringFrequency" style="display:none;">
        <option value="weekly">Weekly</option>
        <option value="4-weekly">Every 4 Weeks</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>

