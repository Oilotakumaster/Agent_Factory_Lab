using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Net.Mail;

namespace CourseService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CourseController : ControllerBase
    {
   
        private readonly IConfiguration _config;
        public CourseController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        public string Get()
        {
            var dummy = new {
                TimeStamp = DateTime.UtcNow
            };

            return JsonSerializer.Serialize(dummy);
        }

        [HttpGet("insertlog/{username}/{course}/{chapter}/{lesson}/{page}")]
        public void InsertLog(string username, string course, string chapter, string lesson, string page)
        {

            SqlParameter[] parameters = new SqlParameter[5];
            parameters[0] = new SqlParameter("userCode", username);
            parameters[1] = new SqlParameter("courseID", course);
            parameters[2] = new SqlParameter("chapterIND", chapter);
            parameters[3] = new SqlParameter("lessonIND", lesson);
            parameters[4] = new SqlParameter("pageIND", page);

            ExecuteSP("spInsertLogContent", parameters);
        }

        [HttpGet("insertscore/{username}/{course}/{scene}/{score}/{nagivation}")]
        public void InsertScore(string username, string course, string scene, string score, string navigation)
        {

            SqlParameter[] parameters = new SqlParameter[5];
            parameters[0] = new SqlParameter("userCode", username);
            parameters[1] = new SqlParameter("courseID", course);
            parameters[2] = new SqlParameter("sceneID", scene);
            parameters[3] = new SqlParameter("score", score);
            parameters[4] = new SqlParameter("navigation", navigation);

            ExecuteSP("spInsertLogSimulation", parameters);
        }

        [HttpGet("validatelogin/{username}/{password}/{course}")]
        public String ValidateLogin(string username, string password, string course)
        {

            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("userCode", username);
            parameters[1] = new SqlParameter("password", password);
            parameters[2] = new SqlParameter("courseID", course);

            Hashtable results = ExecuteSPReader("spLogin", parameters);

            return results["statusCode"].ToString();
        }

        [HttpGet("login/{username}/{password}")]
        public string[] GetCourses(string username, string password)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            //go.Parameters.Add("@InsuredID", SqlDbType.Int).Value = 1; // example value for parameter passing
            parameters[0] = new SqlParameter("@userCode", username);
            parameters[1] = new SqlParameter("@password", password);

            ArrayList results = ExecuteReader("SELECT classID FROM [dbo].[vwClassUserActive] WHERE userCode = @userCode and password = @password", parameters);

            return (string[])results.ToArray(typeof(string));
        }

        [HttpGet("sendmail/{subject}/{body}")]
        public void SendMail(string subject, string body)
        {
            MailMessage mail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient(_config["emailServer"]);

            mail.From = new MailAddress(_config["emailFrom"]);

            string[] emailTo = _config["emailTo"].Split(',');
            foreach (string email in emailTo)
            {
                mail.To.Add(email);
            }

            mail.Subject = subject;
            mail.Body = body;

            SmtpServer.Port = 587;
            SmtpServer.Credentials = new System.Net.NetworkCredential(_config["emailUser"], _config["emailPassword"]);
            SmtpServer.EnableSsl = true;

            SmtpServer.Send(mail);


        }

        private ArrayList ExecuteReader(string sql, SqlParameter[] parameters)
        {
            ArrayList results = new ArrayList();
           
            String connection = _config["courseConnection"];
            // 1. Instantiate the connection
            SqlConnection conn = new SqlConnection(connection);

            SqlDataReader rdr = null;

            try
            {
                // 2. Open the connection
                conn.Open();

                // 3. Pass the connection to a command object

                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.CommandType = CommandType.Text;
                //cmd.Parameters.Add("@InsuredID", SqlDbType.Int).Value = 1; // example value for parameter passing

                cmd.Parameters.AddRange(parameters);

                //
                // 4. Use the connection
                //

                // get query results
                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    try
                    {
                        results.Add(rdr.GetValue(0).ToString());
                    }
                    catch (Exception ex)
                    {
                        //If any error happen, skip to the next row
                        //log.Debug("Error in table row: " + ex.ToString());
                    }
                }

            }
            finally
            {
                // close the reader
                if (rdr != null)
                {
                    rdr.Close();
                }

                // 5. Close the connection
                if (conn != null)
                {
                    conn.Close();
                }
            }
            return results;
        }

        private Hashtable ExecuteSPReader(string spname, SqlParameter[] parameters)
        {
            Hashtable results = new Hashtable();
            //Get connection string from Config file
            String connection = _config["courseConnection"];
            // 1. Instantiate the connection
            SqlConnection conn = new SqlConnection(connection);

            SqlDataReader rdr = null;

            try
            {
                // 2. Open the connection
                conn.Open();

                // 3. Pass the connection to a command object
                string sql = spname;

                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddRange(parameters);

                //
                // 4. Use the connection
                //

                // get query results
                rdr = cmd.ExecuteReader();
                int rowIndex = 0;
                while (rdr.Read())
                {
                    try
                    {

                        for (int i = 0; i < rdr.FieldCount; i++)
                        {
                            results.Add(rdr.GetName(i), rdr.GetValue(i));
                        }


                        rowIndex++;
                    }
                    catch (Exception ex)
                    {
                        //If any error happen, skip to the next row
                        //log.Debug("Error in table row: " + ex.ToString());
                    }
                }
            }
            finally
            {
                // close the reader
                if (rdr != null)
                {
                    rdr.Close();
                }

                // 5. Close the connection
                if (conn != null)
                {
                    conn.Close();
                }
            }
            return results;
        }

        private Hashtable ExecuteSP(string spname, SqlParameter[] parameters)
        {
            Hashtable results = new Hashtable();
            //Get connection string from Config file
            String connection = _config["courseConnection"];
            // 1. Instantiate the connection
            SqlConnection conn = new SqlConnection(connection);

            SqlDataReader rdr = null;

            try
            {
                // 2. Open the connection
                conn.Open();

                // 3. Pass the connection to a command object
                string sql = spname;

                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddRange(parameters);

                //
                // 4. Use the connection
                //


                cmd.ExecuteNonQuery();

            }
            finally
            {
                // 5. Close the connection
                if (conn != null)
                {
                    conn.Close();
                }
            }
            return results;
        }

    }
}
