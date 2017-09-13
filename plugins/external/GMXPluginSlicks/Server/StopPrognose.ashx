<%@ WebHandler Language="C#" Class="startPrognose" %>

using System;
using System.Web;
using System.IO;
using System.Text;
using System.Diagnostics;
using System.Threading;

public class startPrognose : IHttpHandler
{

    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\";

    bool _isIddle = false;

    StreamWriter sw = null;

    public void StopProcess(HttpContext context)
    {
        int my_pid = Convert.ToInt32(context.Request["pid"]);

        string error = "no count";
        string message = "";

        string jsonp = context.Request["callback"];

        if (my_pid != 0)
        {
            Process[] processes = Process.GetProcesses();

            foreach (Process pp in processes)
            {
                error += " " + pp.Id;
                try
                {
                    if (my_pid == pp.Id)
                    {
                        pp.Refresh();
                        if (!pp.HasExited)
                        {
                            pp.Kill();
                            pp.WaitForExit();
                        }
                    }

                    message = my_pid + " process are killed";
                }
                catch (IOException ex)
                {
                    error = ex.Message;
                }
                finally
                {
                    //           
                }
            }
        }

        message = jsonp + "({\"data\":\"" + message + "\", \"error\":\"" + error + "\"})";

        context.Response.ContentType = "application/json";
        context.Response.Write(message);
    }

    public void ProcessRequest(HttpContext context)
    {

        StopProcess(context);

        /*
        string jsonp = "?";// context.Request["callback"];

        if (!String.IsNullOrEmpty(jsonp))
        {
            jsonStr = jsonp + "(" + jsonStr + ")";
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(jsonStr);
        */
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}