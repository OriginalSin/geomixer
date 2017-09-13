<%@ WebHandler Language="C#" Class="startPrognose" %>

using System;
using System.Web;
using System.IO;
using System.Text;
using System.Diagnostics;
using System.Threading;

public class startPrognose : IHttpHandler {

    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\";

    bool _isIddle = false;

    StreamWriter sw = null; 
    
    private void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine){
        if (!String.IsNullOrEmpty(outLine.Data))
        {           
            sw.Write(outLine.Data + "\r\n");

            if (outLine.Data.Trim() == "In world_region_oil_locator at 556") {
                sw.Close();                
            }           
        }       
    }
    
    public void CalledStartProcess(HttpContext context)
    {
        Process[] processes = Process.GetProcesses();

        string description = context.Request["description"];
        string desc_name   = context.Request["name"];
        
        string jsonp = context.Request["callback"];

        string error   = "";
        string message = "";
                 
        foreach (Process pp in processes) {
            string nn = pp.ProcessName;

            if (nn == "world_region_oil_locator")
            {                                               
                message += "####################################  process " + nn + "\n\r";

                //pp.Kill();
            }
            else {
                //message += "process " + nn + "\n\r";                        
            }                   
        }

        if (_isIddle == false)
        {
            //___________________________________________________________Сохраним описание эксперимента
            FileStream fstr = null;
            FileInfo f = new FileInfo(BASE_PATH + @"description\" + desc_name + ".txt");

            try
            {
                fstr = f.Open(FileMode.Create, FileAccess.ReadWrite);
            }
            catch (IOException ex)
            {
                error += ex.Message + "\r\n";
            }
            finally
            {
                //           
            }

            StreamWriter sw = new StreamWriter(fstr, Encoding.GetEncoding("windows-1251"));

            try
            {
                sw.WriteLine(description);
            }
            catch (IOException ex)
            {
                error += ex.Message + "\r\n";
            }
            finally
            {
                //           
            }

            sw.Close();
            //___________________________________________________________Сохраним описание эксперимента
            
            
            
            
            
            
            Directory.SetCurrentDirectory(BASE_PATH);

            Process p = new Process();

            p.StartInfo.FileName = Path.Combine(BASE_PATH, "world_region_oil_locator.exe");
            p.StartInfo.WorkingDirectory = BASE_PATH;
            p.StartInfo.UseShellExecute = true;
            
            //p.StartInfo.RedirectStandardOutput = true;
            //p.OutputDataReceived += new DataReceivedEventHandler(SortOutputHandler);            
            
            try
            {
                _isIddle = true;
                
                /*
                FileStream fstr = null;
                FileInfo f = new FileInfo(BASE_PATH + "log.txt");

                try
                {
                    fstr = f.Open(FileMode.OpenOrCreate, FileAccess.ReadWrite);
                }
                catch (IOException ex)
                {
                    message = ex.Message;
                }
                finally
                {
                    //           
                }
                */
                
                //sw = new StreamWriter(fstr);

                //sw.Write("DATA");

                //sw.Close();
                
                p.Start();

                message = p.Id.ToString();
                
                //p.BeginOutputReadLine();                

                //message = "start";

                if (!String.IsNullOrEmpty(jsonp))
                {
                    message = jsonp + "({\"data\":\"" + message + "\", \"error\":\"" + error + "\"})";
                }                            
            }
            catch (IOException ex)
            {
                error += ex.Message + "\r\n";

                if (!String.IsNullOrEmpty(jsonp))
                {
                    message = jsonp + "({\"data\":\"" + message + "\", \"error\":\"" + error + "\"})";
                }
            }
            finally
            {
                //           
            }                    
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(message);         
    }
   
    public void ProcessRequest (HttpContext context) {
       
        CalledStartProcess(context);
        
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
 
    public bool IsReusable {
        get {
            return false;
        }
    }
}