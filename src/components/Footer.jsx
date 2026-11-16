export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Vulnerability data from the{' '}
        <a href="https://nvd.nist.gov/" target="_blank" rel="noreferrer">
          National Vulnerability Database
        </a>
        . This product uses the NVD API but is not endorsed or certified by the NVD.
      </p>
    </footer>
  );
}
