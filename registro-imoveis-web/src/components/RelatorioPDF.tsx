import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Vistoria } from '../types/vistoria';

const logoBase64 = 'data:image/png;base64,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';

// Estilos específicos para o PDF (parecido com CSS, mas próprio para impressão)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  cabecalhoContainer: { marginBottom: 10, borderBottom: '1px solid #333', paddingBottom: 12 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 10 },
  cabecalhoTexto: { fontSize: 11, textAlign: 'center', fontWeight: 'bold', lineHeight: 1.2 },
  cabecalhoEndereco: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  tituloPrincipal: { fontSize: 14, textAlign: 'center', fontWeight: 'bold', marginTop: 8, marginBottom: 18, textTransform: 'uppercase' },
  section: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  value: { fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
  divisor: { borderBottom: '1px solid #ccc', marginVertical: 15 },
  ambienteTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#0056b3' },
  fotosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  fotoWrapper: { width: '48%', marginBottom: 10 },
  foto: { width: '100%', height: 150, objectFit: 'cover' },
  assinaturaContainer: { marginTop: 24 },
  assinaturaLinha: { fontSize: 11, lineHeight: 1.5, marginTop: 4 },
});

interface Props {
  vistoria: Partial<Vistoria>;
}

// Este é o "desenho" da folha A4
export function RelatorioPDF({ vistoria }: Props) {
  const ambientes = vistoria.ambientes ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalhoContainer}>
          <Image src={logoBase64} style={styles.logo} />
          <Text style={styles.cabecalhoTexto}>PREFEITURA DO MUNICÍPIO DE MARINGÁ</Text>
          <Text style={styles.cabecalhoTexto}>Unidade Temporária</Text>
          <Text style={styles.cabecalhoTexto}>Comissão de Vistoria do Patrimônio Imobiliário</Text>
          <Text style={styles.cabecalhoEndereco}>Rua Néo Alves Martins, 2597 3º Bairro Centro, Maringá/PR</Text>
          <Text style={styles.cabecalhoEndereco}>CEP 87013-060, Telefone: (44) 3127-7004 - www.maringa.pr.gov.br</Text>
        </View>

        <Text style={styles.tituloPrincipal}>Relatório de Vistoria de Imóvel</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Título da Vistoria:</Text>
          <Text style={styles.value}>{vistoria.nomeProjeto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Processo SEI:</Text>
          <Text style={styles.value}>{vistoria.processoSei}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{vistoria.endereco}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Secretaria:</Text>
          <Text style={styles.value}>{vistoria.secretaria}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data da Vistoria:</Text>
          <Text style={styles.value}>
            {vistoria.dataVistoria ? new Date(vistoria.dataVistoria).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{vistoria.observacoes}</Text>
        </View>

        <View style={styles.divisor} />

        {ambientes.map((ambiente, index) => (
          <View key={ambiente.id} style={styles.section}>
            <Text style={styles.ambienteTitle}>Ambiente {index + 1}: {ambiente.nome}</Text>
            <View style={styles.fotosContainer}>
              {ambiente.fotos.map((foto) => (
                <View key={foto.id} style={styles.fotoWrapper}>
                  <Image src={foto.dataUrl || foto.url} style={styles.foto} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.assinaturaContainer}>
          <Text style={styles.label}>Assinaturas:</Text>
          <Text style={styles.assinaturaLinha}>João Barbosa Junior – Presidente</Text>
          <Text style={styles.assinaturaLinha}>Hevellen Cris Correa Puhina Guimarães – Membro</Text>
          <Text style={styles.assinaturaLinha}>Suzan Daiane Iore – Membro</Text>
          <Text style={styles.assinaturaLinha}>Thiago Gomes Mandarino – Membro</Text>
        </View>

      </Page>
    </Document>
  );
}