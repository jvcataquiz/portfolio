     const reveals = document.querySelectorAll('.reveal');

        function revealOnScroll() {
            const windowHeight = window.innerHeight;
            const revealPoint = 100;

            reveals.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                
                if (elementTop < windowHeight - revealPoint) {
                    element.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', revealOnScroll);
        
        // Initial check on page load
        revealOnScroll();

        // Add stagger animation to cards
        document.querySelectorAll('.category').forEach((category, categoryIndex) => {
            const cards = category.querySelectorAll('.tech-card');
            cards.forEach((card, cardIndex) => {
                card.style.animationDelay = `${categoryIndex * 0.1 + cardIndex * 0.05}s`;
            });
        });