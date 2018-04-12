using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;
using Web.Paint.Utils;

namespace Web.Paint.Controllers
{
    [RoutePrefix("api/canvas")]
    public class CanvasController : ApiController
    {
        [HttpGet]
        [Route("list")]
        public String[] GetCanvasFolderList()
        {
            var list = FileUtil.GetCanvasFoldersList(GetPhysicalPath("/"));
            return list;
        }

        [HttpPost]
        [Route("new")]
        public String AddNewCanvasFolder()
        {
            return FileUtil.AddNewCanvasDirectory(GetPhysicalPath("/"));
        }

        [HttpPost]
        [Route("add/{directory}")]
        public void SaveCanvas([FromUri]String directory, [FromBody]String canvasJson)
        {
            FileUtil.SaveCanvasToDirectory(GetPhysicalPath("/"), directory, canvasJson);
        }

        [HttpGet]
        [Route("last/{directory}")]
        public String GetLastSavedCanvas([FromUri]String directory)
        {
            var canvasJson = FileUtil.GetLastCanvasFromDirectory(GetPhysicalPath("/"), directory);
            return canvasJson;
        }

        private String GetPhysicalPath(String virtualPath)
        {
            return HttpContext.Current.Server.MapPath(virtualPath);
        }
    }
}
