const { Client } = require('pg');
const fetch = require('node-fetch');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'EnrollmentDataDetail',
  password: 'root',
  port: 5432,
});

client.connect();

client.query('SELECT PolicyNumber FROM tblanalyticalreport', (error, results) => {
  if (error) throw error;
  
  const policies = results.rows.map((row) => row.policynumber); // Extract policy numbers from query result

  // Loop over policies and make request for each
  policies.forEach((policy) => {
    const body = {
      PolicyNumber: policy,
      "AuthId": "/I5f51Pzmmf4Lf5im5yRXGJXab9hvK5xAgSFadxi6W0="
    };

    fetch('https://software.healthindiatpa.com/HiWebApi/IIBPL/GetEnrollmentDataDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        const dataArray = Object.values(data).slice(2);
        const parsedData = JSON.parse(dataArray[0]);

        // Insert data into PostgreSQL database
        parsedData.forEach((item) => {
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

          client.query(query, values, (err, res) => {
            if (err) {
              console.error(err.stack);
            } else {
              console.log('Data inserted successfully!');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});

client.end();
module.exports = client;
