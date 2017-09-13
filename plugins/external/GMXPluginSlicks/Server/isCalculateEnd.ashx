<%@ WebHandler Language="C#" Class="isCalculateEnd" %>

using System;
using System.Web;
using System.IO;

public class isCalculateEnd : IHttpHandler {

    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\";
    
    public string CalledisCoordsExist(string folder, string name)
    {
        string path = BASE_PATH + folder + @"\results_oil_location\dat\surf_tr_" + name + ".dat";

        bool key = false;
        
        try
        {
            key = new FileInfo(path).Exists;
        }
        catch (IOException ex)
        {
            return "{\"message\": \"" + ex.Message + "\"}"; //"Файл " + name + " не может быть создан!!!";
        }
        finally
        {
            //           
        }
       
        return "{\"message\": \"" + key + "\"}";
    }
    
    public void ProcessRequest (HttpContext context) {
        string folder = context.Request["folder"];
        string name   = context.Request["name"];

        string jsonStr = CalledisCoordsExist(folder, name);

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