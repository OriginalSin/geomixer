using System;
using System.Configuration;
using System.Data;

using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

using System.IO;

public partial class _Default : System.Web.UI.Page 
{
    string cur_path = HttpContext.Current.Server.MapPath("~/");

    enum COMMAND {
        GET_REGION
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        //HttpContext.Current.Cache["key"] = 45;
        /*
        int what_do = Convert.ToInt32(Request.QueryString["do"]);
        string data = Request.QueryString["data"];

        string cmmnd = COMMAND.GET_REGION.ToString();

        if (what_do == (int)COMMAND.GET_REGION)
        {
            Response.Redirect("saveRegion.ashx" + data, true);
        }*/
        /*
        FileStream fstr = null;
        FileInfo f = new FileInfo(cur_path + @"settings.ini");

        try
        {
            fstr = f.Open(FileMode.Open, FileAccess.Read);
        }
        catch (IOException ex)
        {
            //return ex.Message; //"Файл " + name + " не может быть создан!!!";
        }
        finally
        {
            //           
        }

        StreamReader sr = new StreamReader(fstr);

        string base_path = sr.ReadLine();

        //Resources.SlickResource.ResourceManager. SlickResource.base_path = base_path;

       // HttpContext.Current["key"] = base_path;
       // Server.Transfer("TreeLoader.ashx");

        sr.Close();
         * */
    }
}
