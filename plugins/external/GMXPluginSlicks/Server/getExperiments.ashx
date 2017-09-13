<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.IO;

public class Handler : IHttpHandler {    
    string BASE_PATH = HttpContext.Current.Server.MapPath("~/") + @"World_oil_locator\\";

    public string CalledGetExprs(string folder)
    {
        DirectoryInfo regions_dir  = new DirectoryInfo(BASE_PATH + folder + @"\results_oil_location\dat\");
        
        FileInfo[] regions_files = null;
        
        try
        {
            regions_files = regions_dir.GetFiles("*.dat");
        }
        catch (IOException ex)
        {
            return ex.Message; //"Файл " + name + " не может быть создан!!!";            
        }
        finally
        {
            //           
        }
         

        string regions_files_names = "[";
        string descript = "";
        
        FileInfo f = null;
        FileStream fstr = null;
        StreamReader sr = null;
        
        if (regions_files != null)
        {
            var file_name = "";
            
            for (int i = 0; i < regions_files.Length - 1; i++)
            {
                file_name = Path.GetFileNameWithoutExtension(regions_files[i].Name);

                file_name = file_name.Substring(8);


                f = new FileInfo(BASE_PATH + @"description\" + file_name + ".txt");

                if (f.Exists == true) { 
                    fstr = f.Open(FileMode.Open);
                    
                    sr = new StreamReader(fstr);

                    descript = sr.ReadLine();

                    sr.Close();
                }


                regions_files_names += "{\"name\":\"" + file_name + "\", \"descript\":\"" + descript + "\"}, ";
            }

            file_name = Path.GetFileNameWithoutExtension(regions_files[regions_files.Length - 1].Name);

            file_name = file_name.Substring(8);

            f = new FileInfo(BASE_PATH + @"description\" + file_name + ".txt");

            if (f.Exists == true)
            {
                fstr = f.Open(FileMode.Open);

                sr = new StreamReader(fstr);

                descript = sr.ReadLine();

                sr.Close();
            }

            regions_files_names += "{\"name\":\"" + file_name + "\", \"descript\":\"" + descript + "\"}]";
        }
        else {
            regions_files_names += "\"" + "нет экспериментов" + "\"]"; 
        }        

        return regions_files_names;
    }
    
    public void ProcessRequest (HttpContext context) {

        string folder = context.Request["name"];

        string jsonStr = CalledGetExprs(folder);
        
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