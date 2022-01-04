import { Component } from '@angular/core';
import { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth';
import { SecureRandomGenerator } from '@siva7170/inw-secure-random-generator/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  secureRand:any='--------';
  dataLine:any='App opened...';
  clientId:any='myAppName';
  username:any='siva';
  password:any='Testing';
  constructor(private androidFingerprintAuth: AndroidFingerprintAuth,
              private srg:SecureRandomGenerator) {
    this.dataLine += "<br/>Constructor called...";
  }

  genNewRand(){
    this.srg.generateSecureRandom(17,'RAND_ALPHANUMERIC').then((res)=>{
      this.secureRand=res;
      console.log('secure random: ',res);
    },
    (err)=>{
      console.log('secure random: [err]: ',err);
    })
  }

  ionViewDidEnter() {
    this.dataLine += "<br/>ionViewDidEnter...";
    let that=this;
    setTimeout(function(){
      that.dataLine += "<br/>fpToken checking...";
      that.fpTokenCheck();
    },1500)
    
  }

  fpTokenCheck(){
    let fpToken=localStorage.getItem("fpToken");
    if(fpToken!=null){
      this.dataLine += "<br/>fpToken found...";
    
      this.dataLine += "<br/>fpToken is:"+fpToken;
      this.dataLine += "<br/>Request decrypting...";
      let that=this;
      setTimeout(function(){
        that.dataLine += "<br/>decrypting fp ask...";
        that.dataLine += "<br/>clientId:"+that.clientId;
        that.dataLine += "<br/>username:"+that.username;
        that.dataLine += "<br/>expected password from decrypt:"+that.password;
        that.fpAuthDecrypt(fpToken);
      },1500)
      
    }
    else{
      this.dataLine += "<br/>fpToken not found...";
      this.dataLine += "<br/>Request encrypting...";
      let that=this;
      setTimeout(function(){
        that.dataLine += "<br/>encrypting fp ask...";
        that.dataLine += "<br/>clientId:"+that.clientId;
        that.dataLine += "<br/>username:"+that.username;
        that.dataLine += "<br/>password:"+that.password;
        that.fpAuthEncrypt();
      },1500)
    
    }
  }

  fpAuthEncrypt() {
    this.androidFingerprintAuth
      .isAvailable()
      .then((result) => {
        if (result.isAvailable) {
          // it is available

          this.androidFingerprintAuth
            .encrypt({
              clientId: this.clientId,
              username: this.username,
              password: this.password
            })
            .then((result) => {
              if (result.withFingerprint) {
                console.log('Successfully encrypted credentials.');
                console.log('Encrypted credentials: ' + result.token); 
                this.dataLine+='<br/>Successfully encrypted credentials.';
                this.dataLine+='<br/>Encrypted credentials (Token): ' + result.token;
                this.dataLine+='<br/>Time to decrypt...';
                this.dataLine+='<br/>Request to decrypting...';
                localStorage.setItem("fpToken",result.token);
                this.dataLine+='<br/>Token saved...';
                let that=this;
                setTimeout(function(){
                  that.dataLine+='<br/>Decrypt ask...';
                  that.fpAuthDecrypt(result.token);
                },3000)
              } else if (result.withBackup) {
                console.log('Successfully authenticated with backup password!');
              } else console.log("Didn't authenticate!");
            })
            .catch((error) => {
              if (
                error ===
                this.androidFingerprintAuth.ERRORS.FINGERPRINT_CANCELLED
              ) {
                console.log('Fingerprint authentication cancelled');
              } else console.error(error);
            });
        } else {
          // fingerprint auth isn't available
        }
      })
      .catch((error) => console.error(error));
  }

  fpAuthDecrypt(tokenEncrypted: string) {
    this.androidFingerprintAuth
      .isAvailable()
      .then((result) => {
        if (result.isAvailable) {
          // it is available

          this.androidFingerprintAuth
            .decrypt({
              clientId: this.clientId,
              username: this.username,
              token: tokenEncrypted,
            })
            .then((result) => {
              if (result.withFingerprint) {
                if (result.password) {
                  console.log('Successfully decrypted credential token.');
                  console.log('password: ' + result.password);
                  this.dataLine+='<br/>Successfully decrypted credential token..';
                  this.dataLine+='<br/>password: ' + result.password;
                  this.dataLine+='<br/>Verification Done with success!';
                }
              } else if (result.withBackup) {
                console.log('Successfully authenticated with backup password!');
              } else console.log("Didn't authenticate!");
            })
            .catch((error) => {
              if (
                error ===
                this.androidFingerprintAuth.ERRORS.FINGERPRINT_CANCELLED
              ) {
                console.log('Fingerprint authentication cancelled');
              } else console.error(error);
            });
        } else {
          // fingerprint auth isn't available
        }
      })
      .catch((error) => console.error(error));
  }
}
