using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace Web.Paint.Hubs
{
    /// <summary>
    /// Declares the <see cref="Hub"/> which manages multiple clients canvas edits
    /// </summary>
    public class WebPaintHub : Hub
    {
        private static List<ClientHub> _clients = new List<ClientHub>();

        /// <summary>
        /// Updates the whole canvas for all clients except the current one
        /// </summary>
        /// <param name="canvasJson"></param>
        public void UpdateCanvas(String canvasJson, String dir)
        {
            var clientsEditingOtherCanvas = _clients.Where(x => !x.CanvasFolder.Equals(dir) || x.Id.Equals(Context.ConnectionId)).Select(x => x.Id).ToArray();
            Clients.AllExcept(clientsEditingOtherCanvas).updateCanvas(canvasJson);
        }

        /// <summary>
        /// Adds single object to canvas for all clients except the current one
        /// </summary>
        /// <param name="obj"></param>
        public void AddObjectToCanvas(String obj, String dir)
        {
            var clientsEditingOtherCanvas = _clients.Where(x => !x.CanvasFolder.Equals(dir) || x.Id.Equals(Context.ConnectionId)).Select(x => x.Id).ToArray();
            Clients.AllExcept(clientsEditingOtherCanvas).addObjectToCanvas(obj);
        }

        /// <summary>
        /// Updates the single object in canvas for all clients except the current one
        /// </summary>
        /// <param name="obj"></param>
        public void UpdateObjectOnCanvas(String obj, String dir)
        {
            var clientsEditingOtherCanvas = _clients.Where(x => !x.CanvasFolder.Equals(dir) || x.Id.Equals(Context.ConnectionId)).Select(x => x.Id).ToArray();
            Clients.AllExcept(clientsEditingOtherCanvas).updateObjectOnCanvas(obj);
        }

        public void OnDirectoryChanged(String dir)
        {
            var client = _clients.First(x => x.Id.Equals(Context.ConnectionId));
            if (client != null)
            {
                var oldDir = client.CanvasFolder;
                var newDir = dir;
                _clients.First(x => x.Id.Equals(client.Id)).CanvasFolder = dir;

                Clients.Others.onDirectoryChanged(oldDir, newDir);
            }
        }

        public void OnNewCanvasAdded(String dir)
        {
            Clients.Others.onNewCanvasAdded(dir);
        }

        public void OnCanvasSaved(String dir)
        {
            Clients.Others.onCanvasSaved(dir);
        }

        /// <summary>
        /// Notifies the rest clients about current client connected
        /// </summary>
        public void OnClientConnected(String dir)
        {
            var id = Context.ConnectionId;

            if (!_clients.Any(x => x.Id.Equals(id)))
            {
                _clients.Add(new ClientHub
                {
                    Id = id,
                    CanvasFolder = dir
                });
            }

            Clients.Others.onClientConnected(dir);
        }

        /// <summary>
        /// Notifies the rest clients about current client disconnected
        /// </summary>
        /// <param name="stopCalled">Determines whether the connection was closed by client gracefully or by timeout.</param>
        /// <returns></returns>
        public override async Task OnDisconnected(Boolean stopCalled)
        {
            var id = Context.ConnectionId;
            var client = _clients.FirstOrDefault(x => x.Id.Equals(id));
            if (client != null)
            {
                _clients.Remove(client);
            }

            Clients.Others.onClientDisconnected(stopCalled);

            await base.OnDisconnected(stopCalled);
        }
    }
}