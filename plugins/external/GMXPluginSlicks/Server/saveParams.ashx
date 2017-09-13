<%@ WebHandler Language="C#" Class="saveParams" %>

using System;
using System.Web;
using System.IO;
using System.Text;

public class saveParams : IHttpHandler {

    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\\";
    
    public string CalledSaveGeneralParams(string data)
    {
        var message = "";

        if ((data != null) && (!data.Equals("")))
        {
            FileStream fstr = null;
            FileInfo f = new FileInfo(BASE_PATH + "param.txt");

            try
            {
                fstr = f.Open(FileMode.Create, FileAccess.ReadWrite);
            }
            catch (IOException ex)
            {
                message = ex.Message;
            }
            finally
            {
                //           
            }

            StreamWriter sw = new StreamWriter(fstr, Encoding.GetEncoding("windows-1251"));

            string[] lines = data.Split((char)'~');

            foreach (string i in lines)
            {               
                try
                {
                    sw.WriteLine(i);
                }
                catch (IOException ex)
                {
                    message += " " + ex.Message;
                }
                finally
                {
                    //           
                }
            }

            sw.Close();
        }
        else {
            message = "data is null";
        }
        
        return "{\"message\": \"" + message + "\"}";
    }
    
    public void ProcessRequest (HttpContext context) {
        string data = context.Request["data"];

        string jsonStr = CalledSaveGeneralParams(data);

        string jsonp = context.Request["callback"];

        if (!String.IsNullOrEmpty(jsonp))
        {
            jsonStr = jsonp + "(" + jsonStr + ")";
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(jsonStr);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}