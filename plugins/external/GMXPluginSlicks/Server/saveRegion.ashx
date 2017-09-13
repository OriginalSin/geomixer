<%@ WebHandler Language="C#" Class="saveRegion" %>

using System;
using System.Web;
using System.IO;

public class saveRegion : IHttpHandler {
    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\\";

    string message = "";
    
    public string CalledSaveRegion(string name, string data)
    {
        FileStream fstr = null;
        FileInfo f = new FileInfo(BASE_PATH + "resources\\" + name + ".bsn");

        try
        {
            fstr = f.Open(FileMode.Create, FileAccess.ReadWrite);
        }
        catch (IOException ex)
        {
            return "{\"message\": \"" + ex.Message + "\"}"; //"Файл " + name + " не может быть создан!!!";
        }
        finally
        {
            //           
        }

        StreamWriter sw = new StreamWriter(fstr);

        string[] lines = data.Split((char)'~');

        foreach (string i in lines)
        {
            sw.WriteLine(i);
        }

        ///message = fstr.Name;
        
        sw.Close();

        return "{\"message\": \"" + message + "\"}";
    }
    
    public void ProcessRequest (HttpContext context) {

        string name = context.Request["name"]; 
        string data = context.Request["data"];

        string jsonStr = CalledSaveRegion(name, data);

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