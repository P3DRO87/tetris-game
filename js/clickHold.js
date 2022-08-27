const clickHold = (htmlNode, cb, holdSpeed = 100) => {
   let interval;

   const mouseDownCb = (e) => {
      interval = setInterval(() => {
         cb({ ...e, mouseDownCb });
      }, holdSpeed);

      if (e.currentTarget !== htmlNode) {
         clearInterval(interval);
         htmlNode.removeEventListener("mousedown", mouseDownCb);
      }
   };

   const mouseUpCb = (e) => {
      clearInterval(interval);

      if (e.currentTarget !== htmlNode) {
         clearInterval(interval);
         htmlNode.removeEventListener("mousedown", mouseDownCb);
      }
   };

   htmlNode.addEventListener("mousedown", mouseDownCb);

   htmlNode.addEventListener("touchstart", mouseDownCb);

   htmlNode.addEventListener("mouseup", mouseUpCb);

   htmlNode.addEventListener("touchend", mouseUpCb);
};

export default clickHold;
