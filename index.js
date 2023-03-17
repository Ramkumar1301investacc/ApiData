require = require('esm')(module);
const { Client } = require('pg');
const cron = require('node-cron');
const { createLogger, format, transports } = require('winston');


const timestampFormat = format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss',
});


//logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    timestampFormat,
    format.json()
  
  ),
  transports:[
    new transports.File({filename: 'C:/Users/Ramkumar/Desktop/api.log',
    level:'info'})
  ]
});



// Schedule task to run every hour
cron.schedule('1 * * * *', async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'EnrollmentDataDetail',
    password: 'root',
    port: 5432,
  });

  try {
    await client.connect();

    // Truncate table
    await client.query('TRUNCATE TABLE enrollmentdatadeatil');
   console.log('table truncated ');
   logger.log('info', 'Table truncated');

    const results = await client.query('SELECT PolicyNumber FROM tblanalyticalreport');

    const policies = results.rows.map((row) => row.policynumber);

    for (const policy of policies) {
      const body = {
        PolicyNumber: policy,
        "AuthId": "/I5f51Pzmmf4Lf5im5yRXGJXab9hvK5xAgSFadxi6W0="
      };

      const response = await fetch('https://software.healthindiatpa.com/HiWebApi/IIBPL/GetEnrollmentDataDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const dataArray = Object.values(data).slice(2);
      const parsedData = JSON.parse(dataArray[0]);

      for (const item of parsedData) {
        const query =
          'INSERT INTO enrollmentdatadeatil(PolicyNumber, EmployeeName, EmployeeCode, SumInsured, FamilyCode, HealthIndiaId, InsuredName, Gender, DateofBirth, Age, MobileNo, EmailId, PolicyJoiningDate, EndorsementDate, AddedDate, Relation, Status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)';
        const values = [
          item.PolicyNumber,
          item.EmployeeName,
          item.EmployeeCode,
          item.SumInsured,
          item.FamilyCode,
          item.HealthIndiaID,
          item.InsuredName,
          item.Gender,
          item.DateofBirth,
          item.Age,
          item.MobileNo,
          item.EmailId,
          item.PolicyJoiningDate,
          item.EndorsementDate,
          item.AddedDate,
          item.Relation,
          item.Status,
        ];

        await client.query(query, values);
        logger.log('info', 'Data inserted for policy number: ' + item.PolicyNumber);
      }
    }

    console.log('Data inserted successfully!');
   
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
  
});
