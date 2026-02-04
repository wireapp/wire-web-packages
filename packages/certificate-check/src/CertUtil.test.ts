/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import * as fs from 'fs';
import * as path from 'path';

import {ElectronCertificate} from './CertUtil';

import {buildCert, getFingerprint, hostnameShouldBePinned, verifyPinning, WILDCARD_CERT_FINGERPRINT} from './';

describe('hostnameShouldBePinned', () => {
  it('pins app.wire.com', () => {
    const result = hostnameShouldBePinned('app.wire.com');
    expect(result).toBe(true);
  });

  it(`doesn't pin localhost`, () => {
    const result = hostnameShouldBePinned('localhost');
    expect(result).toBe(false);
  });
});

describe('getFingerprint', () => {
  it('validates the fingerprint for wire.com', () => {
    const certificatePath = path.join(__dirname, '../spec/helpers/wire.com-wildcard.der');
    const file = fs.readFileSync(certificatePath);
    const fingerprint = getFingerprint(file);

    expect(fingerprint).toBe(WILDCARD_CERT_FINGERPRINT);
  });
});

describe('verifyPinning', () => {
  it('verifies the certificate for wire.com with CA-based pinning', () => {
    const certificatePath = path.join(__dirname, '../spec/helpers/wire.com-wildcard.der');
    const issuerCertPath = path.join(__dirname, '../spec/helpers/wire.com-issuer.der');
    const rootCertPath = path.join(__dirname, '../spec/helpers/DigiCert-Global-Root-G2.pem');

    const certFile = fs.readFileSync(certificatePath);
    const issuerCertFile = fs.readFileSync(issuerCertPath);
    const rootCertFile = fs.readFileSync(rootCertPath, 'utf-8');

    // Full certificate chain: leaf -> intermediate -> root
    const certData: ElectronCertificate = {
      data: buildCert(certFile),
      issuerCert: {
        data: buildCert(issuerCertFile),
        issuerCert: {
          data: rootCertFile,
        },
      },
    };

    const pinningResult = verifyPinning('wire.com', certData);

    // CA-based pinning: verify issuer root cert matches allowed CAs
    expect(pinningResult.verifiedIssuerRootCerts).toBe(true);
    // publicKeyInfo is now empty, so this is vacuously true
    expect(pinningResult.verifiedPublicKeyInfo).toBe(true);
    expect(pinningResult.errorMessage).toBeUndefined();
  });

  it('rejects certificate with unknown root CA', () => {
    const certificatePath = path.join(__dirname, '../spec/helpers/wire.com-wildcard.der');
    const wrongRootCertPath = path.join(
      __dirname,
      '../spec/helpers/VeriSign-Class-3-Public-Primary-Certification-Authority-G4.pem',
    );

    const certFile = fs.readFileSync(certificatePath);
    const wrongRootCertFile = fs.readFileSync(wrongRootCertPath, 'utf-8');

    // Certificate chain with wrong root CA
    const certData: ElectronCertificate = {
      data: buildCert(certFile),
      issuerCert: {
        data: wrongRootCertFile, // Wrong CA - G4 is not in trusted roots for wire.com
      },
    };

    const pinningResult = verifyPinning('wire.com', certData);

    // Should fail root cert verification
    expect(pinningResult.verifiedIssuerRootCerts).toBe(false);
    expect(pinningResult.errorMessage).toMatch(/none of .* could be verified/);
  });

  it('accepts Amazon Root CA for wire.com (future ACM migration)', () => {
    const certificatePath = path.join(__dirname, '../spec/helpers/wire.com-wildcard.der');
    const amazonRootCertPath = path.join(__dirname, '../spec/helpers/Amazon-Root-CA-1.pem');

    const certFile = fs.readFileSync(certificatePath);
    const amazonRootCertFile = fs.readFileSync(amazonRootCertPath, 'utf-8');

    // Simulates future ACM cert chain with Amazon root
    const certData: ElectronCertificate = {
      data: buildCert(certFile),
      issuerCert: {
        data: amazonRootCertFile, // Amazon Root CA is in trusted roots for wire.com
      },
    };

    const pinningResult = verifyPinning('wire.com', certData);

    // Amazon Root CA 1 is in the trusted roots for wire.com
    expect(pinningResult.verifiedIssuerRootCerts).toBe(true);
    expect(pinningResult.errorMessage).toBeUndefined();
  });

  it('accepts Let\'s Encrypt Root CA for wire.com (future LE migration)', () => {
    const certificatePath = path.join(__dirname, '../spec/helpers/wire.com-wildcard.der');
    const leRootCertPath = path.join(__dirname, '../spec/helpers/ISRG-Root-X1.pem');

    const certFile = fs.readFileSync(certificatePath);
    const leRootCertFile = fs.readFileSync(leRootCertPath, 'utf-8');

    // Simulates future Let's Encrypt cert chain
    const certData: ElectronCertificate = {
      data: buildCert(certFile),
      issuerCert: {
        data: leRootCertFile, // ISRG Root X1 is in trusted roots for wire.com
      },
    };

    const pinningResult = verifyPinning('wire.com', certData);

    // ISRG Root X1 is in the trusted roots for wire.com
    expect(pinningResult.verifiedIssuerRootCerts).toBe(true);
    expect(pinningResult.errorMessage).toBeUndefined();
  });

  it('checks for the correct root certificate', () => {
    const certificatePath = path.join(
      __dirname,
      '../spec/helpers/VeriSign-Class-3-Public-Primary-Certification-Authority-G5.pem',
    );
    const certFile = fs.readFileSync(certificatePath, 'utf-8');

    const certData: ElectronCertificate = {
      data: certFile,
      issuerCert: {data: certFile},
    };

    const pinningResult = verifyPinning('58gewxuxp0gp84o4zi8vppxz8.cloudfront.net', certData);

    expect(pinningResult.verifiedIssuerRootCerts).toBe(true);
    expect(pinningResult.errorMessage).toBeUndefined();
  });

  it('checks for wrong root certificates', () => {
    const wrongCertificatePath = path.join(
      __dirname,
      '../spec/helpers/VeriSign-Class-3-Public-Primary-Certification-Authority-G4.pem',
    );
    const wrongCertFile = fs.readFileSync(wrongCertificatePath, 'utf-8');

    const certData: ElectronCertificate = {
      data: wrongCertFile,
      issuerCert: {data: wrongCertFile},
    };

    const pinningResult = verifyPinning('58gewxuxp0gp84o4zi8vppxz8.cloudfront.net', certData);

    expect(pinningResult.verifiedIssuerRootCerts).toBe(false);
    expect(pinningResult.errorMessage).toMatch(/none of .* could be verified/);
  });

  it('checks for broken root certificates', () => {
    const brokenCertificatePath = path.join(
      __dirname,
      '../spec/helpers/VeriSign-Class-3-Public-Primary-Certification-Authority-G5-BROKEN.pem',
    );
    const brokenCertFile = fs.readFileSync(brokenCertificatePath, 'utf-8');

    const certData: ElectronCertificate = {
      data: brokenCertFile,
      issuerCert: {data: brokenCertFile},
    };

    const pinningResult = verifyPinning('58gewxuxp0gp84o4zi8vppxz8.cloudfront.net', certData);

    expect(pinningResult.verifiedIssuerRootCerts).toBe(false);
    expect(pinningResult.errorMessage).toMatch(/none of .* could be verified/);
  });
});
