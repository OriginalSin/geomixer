<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.IO;

public class Handler : IHttpHandler {    
    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\\";
   
    public string CalledGetRegions()
    {
        DirectoryInfo regions_dir = new DirectoryInfo(BASE_PATH + @"resources\");
      
        FileStream fstr = null;
        StreamReader sr = null;
        
        FileInfo[] regions_files = regions_dir.GetFiles("*.BSN");

        string lon = "";
        string lat = "";
        string data = "";
        
        string regions_files_names = "[";
       
        for (int i = 0; i < regions_files.Length - 1; i++)
        {
            fstr = regions_files[i].Open(FileMode.Open);
                
            sr = new StreamReader(fstr);

            sr.ReadLine();
            sr.ReadLine();
            sr.ReadLine();

            lon = sr.ReadLine();

            sr.ReadLine();

            lat = sr.ReadLine();

            data = "[\"" + lon + "\", \"" + lat + "\"]";
            
            sr.Close();
            
            regions_files_names += "{\"name\":\"" + Path.GetFileNameWithoutExtension(regions_files[i].Name) + "\", \"data\":" + data + "}, ";
        }

        fstr = regions_files[regions_files.Length - 1].Open(FileMode.Open);

        sr = new StreamReader(fstr);

        sr.ReadLine();
        sr.ReadLine();
        sr.ReadLine();

        lon = sr.ReadLine();

        sr.ReadLine();

        lat = sr.ReadLine();

        data = "[\"" + lon + "\", \"" + lat + "\"]";

        sr.Close();

        regions_files_names += "{\"name\":\"" + Path.GetFileNameWithoutExtension(regions_files[regions_files.Length - 1].Name) + "\", \"data\":" + data + "}]";

        return "{\"files\":" + regions_files_names + "}";
    }
    
    public void ProcessRequest (HttpContext context) {
       
        //string value = (string)context.Cache["key"];
        
        string jsonStr = CalledGetRegions();
        string jsonp = context.Request["callback"];
        
        if (!String.IsNullOrEmpty(jsonp)){
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