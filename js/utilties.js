function toArabicTime(a) {
    var b = a, c = "", d = "", e = "", f = "";
    if ("" === a) return "";
    0 <= a.indexOf("d") && (b = a.split("d"), c = "" !== b[0] ? b[0] + " يوم " : "", b = b[1]);
    0 <= a.indexOf("h") && (b = b.split("h"), d = "" !== b[0] ? b[0] + " ساعة " : "", b = b[1]);
    0 <= a.indexOf("m") && (b = b.split("m"), e = "" !== b[0] ? b[0] + " دقيقة " : "", b = b[1]);
    0 <= a.indexOf("s") && (a = b.split("s"), f = "" !== a[0] ? a[0] + " ثانية " : "");
    return c + d + e + f;
  }
  
  function toArabicBytes(a) {
    return 1024 > a ? a + " بايت " :
      1048576 > a ? Math.round(a / 1024) + " كيلوبايت " :
      1073741824 > a ? Math.round(a / 1048576) + " ميجابايت " :
      (a / 1073741824).toFixed(2) + " جيجابايت ";
  }



  document.addEventListener('DOMContentLoaded', () => {
    const hotspotVars = document.getElementById('hotspotVars');
    const uptime = hotspotVars.dataset.uptime;
    const timeleft = hotspotVars.dataset.timeleft;
    document.getElementById("uptime").textContent = toArabicTime(uptime)
    const timeLeft =  document.getElementById("timeleft")
    if(timeLeft){
        timeLeft.textContent = toArabicTime(timeleft)
    }
    const remain = document.getElementById("remain")
    if(remain){
        remain.textContent= toArabicBytes(hotspotVars.dataset.remain)
    }
  })