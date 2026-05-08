//pipe bech yformaty les prix mte3na w ykoun 3ando 2 chiffres apres la virgule w ykoun fiha TND
//par example 1200 tawli 1200.00 TND
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCurrency'
})
//he4a classe bech ykoun responsable 3la formaty les prix mte3na w ykoun 3ando 2 chiffres apres la virgule w ykoun fiha TND
export class FormatCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string {
    // ken value null wela empty string n returni 0.00 TND
    if (value == null || value === '') {
      return '0.00 TND';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return '0.00 TND';
    }
    
    const minimumFractionDigits = digitsInfo.includes('-0') ? 0 : 2;
    const maximumFractionDigits = digitsInfo.includes('-0') ? 0 : 2;
    //forma lo5renya bech ykoun 3ando 2 chiffres apres la virgule w ykoun fiha TND
    return `${numValue.toLocaleString('en-US', { minimumFractionDigits, maximumFractionDigits })} TND`;
  }
}
