import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--color-background)' }}>
      <Helmet>
        <title>Privacy Policy | TravelStay</title>
      </Helmet>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '24px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '40px', fontSize: 'var(--text-lg)' }}>Last updated: June 9, 2026</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>1. Introduction</h2>
              <p>Welcome to TravelStay. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when registering on the App, expressing an interest in obtaining information about us or our products and services, when participating in activities on the App or otherwise contacting us.</p>
              <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Personal Data:</strong> Name, email address, phone number, and payment information.</li>
                <li><strong>Usage Data:</strong> Information on how the App is accessed and used.</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track the activity on our App and we hold certain information.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>3. How We Use Your Information</h2>
              <p>We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>4. Will Your Information Be Shared With Anyone?</h2>
              <p>We only share and disclose your information in the following situations:</p>
              <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Compliance with Laws:</strong> We may disclose your information where we are legally required to do so.</li>
                <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, or as evidence in litigation in which we are involved.</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
