<%@ WebHandler Language="C#" Class="getCoords" %>

using System;
using System.Web;
using System.IO;

public class getCoords : IHttpHandler {

    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\";
   
    public string CalledgetCoords(string folder, string name)
    {
        string path = BASE_PATH + folder + "\\results_oil_location\\dat\\surf_tr_" + name + ".DAT";

        FileStream fstr = null;
        FileInfo f = new FileInfo(path);

        var now_time = DateTime.Now;
        var file_time = f.CreationTime;
        
        try
        {
            fstr = f.Open(FileMode.Open, FileAccess.Read);
        }
        catch (IOException ex)
        {
            return ex.Message; //"Файл " + name + " не может быть создан!!!";
        }
        finally
        {
            //           
        }
       
        StreamReader sr = new StreamReader(fstr);

        string line = "";

        string ret_coords = "";

        while ((line = sr.ReadLine()) != null)
        {
            if (line.Length > 0)
            {
                string[] par = line.Split((char)'\t');

                string param = par[0] + "#" + par[1] + "#" +
                               par[2] + "#" + par[3] + "#" +
                               par[4] + "#" + par[5] + "#" +
                               par[6] + "#" + par[7];

                ret_coords += param + "~";
            }
            else {
                int y = 0;
            }
        }

        sr.Close();

        ret_coords = ret_coords.Remove(ret_coords.Length - 1);   
        
        return "{\"coords\": \"" + ret_coords + "\"}";
    }
    
    public void ProcessRequest (HttpContext context) {
        string folder = context.Request["folder"];
        string name   = context.Request["name"];

        string jsonStr = CalledgetCoords(folder, name);

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