using System;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Web.Paint.Startup))]

namespace Web.Paint
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
