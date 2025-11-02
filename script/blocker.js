
  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert("Right-click is disabled on this page.");
  });

  // Disable certain keys (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+J)
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      alert("Inspect is disabled.");
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      alert("Inspect is disabled.");
    }
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      alert("Inspect is disabled.");
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      alert("View source is disabled.");
    }
  });
