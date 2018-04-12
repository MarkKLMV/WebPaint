using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Web.Paint
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/Scripts/jquery/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap/bootstrap.min.js",
                "~/Scripts/bootstrap/bootstrap-colorpicker.min.js",
                "~/Scripts/bootstrap/bootstrap-slider.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/fabricjs").Include(
                "~/Scripts/fabric/fabric.{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/paint").Include(
                "~/Scripts/paint/main.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                "~/Scripts/jquery/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                "~/Scripts/jquery/jquery.unobtrusive*",
                "~/Scripts/jquery/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/signalR").Include(
                "~/Scripts/jquery/jquery.signalR-{version}.js",
                "~/Scripts/signalR/main.js"));

            bundles.Add(new ScriptBundle("~/bundles/notice").Include(
                "~/Scripts/jquery/jquery.gritter.min.js",
                "~/Scripts/notice/main.js"));

            bundles.Add(new ScriptBundle("~/bundles/tested-code").Include(
                "~/Scripts/jquery/jquery-{version}.js",
                "~/Scripts/fabric/fabric.{version}.js",
                "~/Scripts/jquery/jquery.signalR-{version}.js",
                "~/Scripts/signalR/main.js",
                "~/Scripts/paint/main.js",
                "~/Scripts/notice/main.js"));

            bundles.Add(new ScriptBundle("~/bundles/tests").Include(
                "~/Scripts/qunit.js",
                "~/Scripts/test/main.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/bootstrap").Include(
#if DEBUG
                "~/Content/bootstrap-colorpicker/css/bootstrap-colorpicker.css",
#else
                "~/Content/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css",
#endif
                "~/Content/bootstrap-slider/bootstrap-slider.min.css",
                "~/Content/bootstrap.min.css",
                "~/Content/bootstrap-theme.min.css",
                "~/Content/bootstrap-responsive.min.css"));

            bundles.Add(new StyleBundle("~/Content/jquery").Include(
                "~/Content/jquery.gritter.css"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/Site.css",
                "~/Content/font-awesome.min.css"));
        }
    }
}