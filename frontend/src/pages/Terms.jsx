import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--color-background)' }}>
      <Helmet>
        <title>Terms of Service | TravelStay</title>
      </Helmet>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '24px' }}>Terms of Service</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '40px', fontSize: 'var(--text-lg)' }}>Last updated: June 9, 2026</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
              <p>By accessing or using TravelStay, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>2. Accounts</h2>
              <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>3. Listings and Reservations</h2>
              <p>TravelStay acts as a platform connecting hosts and guests. We are not a party to any agreement between users. Hosts are entirely responsible for their listings. When a guest makes a reservation, they are entering into a contract directly with the host.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>4. Payment Processing</h2>
              <p>We use a third-party payment processor to bill you through a payment account linked to your account on the Services. The processing of payments will be subject to the terms, conditions, and privacy policies of the Payment Processor in addition to these Terms.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>5. Cancellation Policy</h2>
              <p>Cancellations are subject to the specific policy selected by the Host for their listing. Guests are responsible for reviewing the cancellation policy before making a reservation.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
