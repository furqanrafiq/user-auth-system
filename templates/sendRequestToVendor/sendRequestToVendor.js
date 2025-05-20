const sendRequestToVendorEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome Email</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f6f9fc;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.05);
      text-align:center;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
      color: #2c3e50;
    }
    .content {
      padding: 30px 0;
      color: #555555;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      margin-top: 20px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to EasyShadi</h1>
    </div>
    <div class="content">
      <p>Hi {{vendorName}},</p>
      <p>You have received a new booking request from the user {{userName}}</p>
      <p>Please check the bookings tab in your dashboard to view all the bookings.</p>
      <a href={{link}} class="button">View Bookings</a>
    </div>
    <div class="footer">
      &copy; 2025 EasyShadi. All rights reserved.<br/>
    </div>
  </div>
</body>
</html>
`

module.exports = sendRequestToVendorEmail