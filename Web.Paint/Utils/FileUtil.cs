using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace Web.Paint.Utils
{
    public class FileUtil
    {
        public static String CanvasFolderPath => @"Files\Canvases\";

        public static String[] GetCanvasFoldersList(String physicalPath)
        {
            var canvasesPath = Path.Combine(physicalPath, CanvasFolderPath);

            if (!Directory.Exists(canvasesPath))
            {
                Directory.CreateDirectory(canvasesPath);

                return new String[] {};
            }

            var foldersHtmlTemplates = new List<String>();

            DirectoryInfo di = new DirectoryInfo(canvasesPath);

            var dirNames = di.GetDirectories()
                .Select(x => x.Name)
                .ToArray();

            Array.ForEach(dirNames, name =>
            {
                foldersHtmlTemplates.Add(String.Format(OPTION_HTML_TEMPLATE, name));
            });

            return foldersHtmlTemplates.ToArray();
        }

        public static String AddNewCanvasDirectory(String physicalPath)
        {
            var canvasesPath = Path.Combine(physicalPath, CanvasFolderPath);

            DirectoryInfo di = new DirectoryInfo(canvasesPath);
            var curValue = GetLastCanvasDirectory(canvasesPath);

            var nextValue = curValue == null
                ? "1"
                : (Convert.ToInt64(curValue.Name) + 1).ToString();

            // check if directory could have been alreaddy created by other user
            if (!Directory.Exists(Path.Combine(canvasesPath, nextValue)))
            {
                Directory.CreateDirectory(Path.Combine(canvasesPath, nextValue));
            }

            return String.Format(OPTION_HTML_TEMPLATE, nextValue);
        }

        public static void SaveCanvasToDirectory(String physicalPath, String directoryName, String canvasJson)
        {
            if (directoryName.Equals("0")) // prevent saving canvas to unexisting directory
            {
                return;
            }

            var canvasPath = Path.Combine(physicalPath, CanvasFolderPath, directoryName);

            var fileName = String.Format(CANVAS_FILE_TEMPLATE, DateTime.UtcNow.ToString("yyyyMMdd_HHmmssFF"));

            using (var sw = new StreamWriter(Path.Combine(canvasPath, fileName)))
            {
                sw.WriteLine(canvasJson);
            }
        }

        public static String GetLastCanvasFromDirectory(String physicalPath, String directoryName)
        {
            String canvasJson = String.Empty;

            var canvasPath = Path.Combine(physicalPath, CanvasFolderPath, directoryName);
            var fileName = Directory.GetFiles(canvasPath, CANVAS_FILE_PATTERN)
                .OrderByDescending(x => x)
                .FirstOrDefault();

            if (!String.IsNullOrEmpty(fileName))
            {
                using (var sr = new StreamReader(Path.Combine(canvasPath, fileName)))
                {
                    canvasJson = sr.ReadLine();
                }
            }

            return canvasJson;
        }

        private static DirectoryInfo GetLastCanvasDirectory(String physicalPath)
        {
            DirectoryInfo di = new DirectoryInfo(physicalPath);
            return di.GetDirectories().OrderByDescending(x => x.Name).FirstOrDefault();
        }

        private const String OPTION_HTML_TEMPLATE = "<option value=\"{0}\">{0}</option>";
        private const String CANVAS_FILE_TEMPLATE = "{0}.json";
        private const String CANVAS_FILE_PATTERN = "*.json";
    }
}